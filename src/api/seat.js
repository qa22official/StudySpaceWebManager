// src/api/seat.js
import request from './index'; // 引用同目录下的 index.js (axios实例)

/**
 * 4. 查询座位状态
 * GET /rooms/{room_id}/seats
 * 
 * @param {string} roomId - 自习室ID (例如: room_dw_301)
 * @param {Object} params - 查询参数
 * @param {string} params.date - 日期 (YYYY-MM-DD)
 * @param {string} params.start_time - 开始时间 (HH:MM)
 * @param {string} params.end_time - 结束时间 (HH:MM)
 */
export function getBaseData() {
  // 同时请求 /campuses, /buildings, /rooms 三个接口，优先使用后端预置的层级数据
  const parseList = (res) => {
    if (!res) return [];
    const payload = res.data !== undefined ? res.data : res;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.data)) return payload.data;
    if (Array.isArray(payload.items)) return payload.items;
    return [];
  };

  const pCampuses = request({ url: '/campuses', method: 'get' }).catch(() => null);
  const pBuildings = request({ url: '/buildings', method: 'get' }).catch(() => null);
  const pRooms = request({ url: '/rooms', method: 'get' }).catch(() => null);

  return Promise.all([pCampuses, pBuildings, pRooms]).then(([resC, resB, resR]) => {
    const campusesRaw = parseList(resC);
    const buildingsRaw = parseList(resB);
    const roomsRaw = parseList(resR);

    // 规范化 campuses/buildings/rooms 字段名以供前端使用
    const campuses = campusesRaw.map((c) => ({
      id: String(c.id ?? c._id ?? c.name ?? ''),
      name: c.name ?? c.title ?? String(c.id ?? c._id ?? c.name ?? '')
    }));

    const buildings = buildingsRaw.map((b) => ({
      id: String(b.id ?? b._id ?? b.name ?? ''),
      name: b.name ?? b.title ?? String(b.id ?? b._id ?? b.name ?? ''),
      campus_id: String(b.campus_id ?? b.campus ?? ''),
      max_floor: b.max_floor ?? b.maxFloor ?? 0
    }));

    // 建立按 id/name 的快速查找表
    const campusById = new Map(campuses.map(c => [c.id, { ...c }]));
    const campusByName = new Map(campuses.map(c => [c.name, { ...c }]));
    const buildingById = new Map(buildings.map(b => [b.id, { ...b }]));
    const buildingByName = new Map(buildings.map(b => [b.name, { ...b }]));

    // 确保 buildings 的 campus_id 指向已有 campus id（若为 name 则转换）
    for (const [id, b] of buildingById.entries()) {
      if (b.campus_id && campusById.has(b.campus_id)) continue;
      if (b.campus_id && campusByName.has(b.campus_id)) {
        b.campus_id = campusByName.get(b.campus_id).id;
        buildingById.set(id, b);
        buildingByName.set(b.name, b);
      }
    }

    // Helper: make safe id from name
    const makeId = (prefix, name) => `${prefix}_${encodeURIComponent(String(name).replace(/\s+/g,'_'))}`;

    // 处理 rooms：把 rooms 中的 building/campus 名称映射到对应 id；若后端只返回名称则补全 id
    const rooms = roomsRaw.map((item) => {
      const rid = String(item.id ?? item.room_id ?? item._id ?? '');
      const buildingNameRaw = item.building_name ?? item.building ?? '';
      const campusNameRaw = item.campus_name ?? item.campus ?? '';

      // 先尝试通过 name 查找已有 building/campus
      let bid = item.building_id ? String(item.building_id) : '';
      let cid = item.campus_id ? String(item.campus_id) : '';

      if (!cid && campusNameRaw) {
        const foundC = campusByName.get(campusNameRaw);
        if (foundC) cid = foundC.id;
        else {
          cid = makeId('campus', campusNameRaw || `c_${rid}`);
          const newC = { id: cid, name: campusNameRaw || cid };
          campusById.set(cid, newC);
          campusByName.set(newC.name, newC);
        }
      }

      if (!bid && buildingNameRaw) {
        const foundB = buildingByName.get(buildingNameRaw);
        if (foundB) {
          bid = foundB.id;
          // ensure building has correct campus_id
          if (!foundB.campus_id && cid) {
            foundB.campus_id = cid;
            buildingById.set(bid, foundB);
            buildingByName.set(foundB.name, foundB);
          }
        } else {
          // create new building id and register
          bid = makeId('building', buildingNameRaw || `b_${rid}`);
          const newB = { id: bid, name: buildingNameRaw || bid, campus_id: cid || '' , max_floor: item.max_floor || 0 };
          buildingById.set(bid, newB);
          buildingByName.set(newB.name, newB);
        }
      }

      return {
        id: rid,
        name: item.name ?? item.room_name ?? item.title ?? '',
        building_id: bid,
        building_name: buildingNameRaw || (buildingById.get(bid) && buildingById.get(bid).name) || '',
        campus_id: cid,
        campus_name: campusNameRaw || (campusById.get(cid) && campusById.get(cid).name) || '',
        floor: item.floor ?? item.level ?? item.floor_number ?? 1,
        max_floor: item.max_floor ?? item.maxFloor ?? item.building?.max_floor ?? 0,
        zone: item.zone ?? item.section ?? null,
        is_quiet: !!item.is_quiet || !!item.quiet_zone || false,
        ...item
      };
    });

    const finalCampuses = Array.from(campusById.values());
    const finalBuildings = Array.from(buildingById.values());

    return {
      code: 0,
      data: {
        campuses: finalCampuses,
        buildings: finalBuildings,
        rooms
      }
    };
  });
}

/**
 * (可选) 获取房间列表，用于筛选页跳转
 * 如果你的项目中已有此接口，可忽略
 */
export function getAllRooms(params) {
  return request({
    url: '/rooms',
    method: 'get',
    params
  });
}

/**
 * 查询指定自习室当前时间段座位状态
 */
export function getRoomSeats(roomId, params) {
  return request({
    url: `/rooms/${roomId}/seats`,
    method: 'get',
    params
  }).then(res => {
    // 兼容后端可能直接返回数组或返回 { code, data } 结构
    if (res && res.data && (res.data.code !== undefined)) {
      return res.data;
    }
    // 如果后端直接返回数组或对象，规范为 { code:0, data: { data: ... } }
    return { code: 0, data: { data: res.data } };
  });
}

/**
 * 创建预约
 */
export function createReservation(params) {
  return request({
    url: '/reservations',
    method: 'post',
    data: params
  });
}