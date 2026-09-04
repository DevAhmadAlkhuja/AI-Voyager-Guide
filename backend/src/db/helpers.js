const { getPool } = require("./pool");

async function q(sql, params = {}) {
  const [rows] = await getPool().query(sql, params);
  return rows;
}

function toUserDto(row) {
  if (!row) return null;
  const settings = typeof row.settings === "string" ? safeJson(row.settings) : row.settings;
  return {
    _id: String(row.id),
    id: row.id,
    name: row.name,
    firstName: row.first_name ?? undefined,
    lastName: row.last_name ?? undefined,
    email: row.email,
    phone: row.phone ?? undefined,
    profileImageUrl: row.profile_image ?? row.profile_image_url ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    gender: row.gender ?? undefined,
    country: row.country ?? undefined,
    city: row.city ?? undefined,
    address: row.address ?? undefined,
    postalCode: row.postal_code ?? undefined,
    language: row.language ?? undefined,
    bio: row.bio ?? undefined,
    role: row.role,
    settings: settings || {},
    createdAt: row.created_at,
    lastSeen: row.last_seen,
    lastLoginAt: row.last_login_at ?? undefined,
    lastActivityAt: row.last_activity_at ?? undefined,
    totalBookings: row.total_bookings !== undefined ? Number(row.total_bookings) : undefined,
    mostBookedDestination: row.most_booked_destination ?? undefined,
    mostBookedActivity: row.most_booked_activity ?? undefined,
  };
}

function safeJson(v) {
  try {
    return JSON.parse(v);
  } catch {
    return {};
  }
}

module.exports = { q, toUserDto };
