export const DEMO_ORIGIN = {
  lat: -26.2041,
  lng: 28.0473,
  label: 'Johannesburg',
};

export const distanceKm = (a, b) => {
  const earthRadius = 6371;

  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const deltaLat = ((b.lat - a.lat) * Math.PI) / 180;
  const deltaLng = ((b.lng - a.lng) * Math.PI) / 180;

  const x =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const y = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));

  return earthRadius * y;
};

export const googleMapsUrl = (facility) => {
  const parts = [
    facility.name,
    facility.address,
    facility.locality,
    facility.district,
    facility.province,
    'South Africa',
  ].filter(Boolean);

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    parts.join(', ')
  )}`;
};

const serviceIntent = (query) => {
  const value = query.toLowerCase();

  if (
    value.includes('diabetes') ||
    value.includes('blood sugar')
  ) {
    return 'diabetes';
  }

  if (
    value.includes('hiv') ||
    value.includes('aids')
  ) {
    return 'hiv';
  }

  if (
    value.includes('tb') ||
    value.includes('tuberculosis')
  ) {
    return 'tb';
  }

  if (
    value.includes('family planning') ||
    value.includes('contraception')
  ) {
    return 'family-planning';
  }

  if (
    value.includes('mental') ||
    value.includes('psych')
  ) {
    return 'mental-health';
  }

  if (
    value.includes('maternal') ||
    value.includes('pregnancy') ||
    value.includes('antenatal')
  ) {
    return 'maternal-health';
  }

  return null;
};

const serviceMatchesIntent = (service, intent) => {
  if (!intent) return false;

  const text = [
    service.name,
    service.category,
    service.note,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const keywords = {
    diabetes: ['diabetes', 'blood sugar', 'chronic disease'],
    hiv: ['hiv', 'aids'],
    tb: ['tb', 'tuberculosis'],
    'family-planning': [
      'family planning',
      'contraception',
      'contraceptive',
    ],
    'mental-health': [
      'mental',
      'psych',
      'counselling',
      'counseling',
    ],
    'maternal-health': [
      'maternal',
      'pregnancy',
      'antenatal',
      'maternity',
    ],
  };

  return keywords[intent]?.some((keyword) =>
    text.includes(keyword)
  );
};

export const searchFacilities = (
  facilities,
  {
    query = '',
    type = '',
    province = '',
    origin = DEMO_ORIGIN,
  } = {}
) => {
  const cleanQuery = query.trim().toLowerCase();
  const intent = serviceIntent(cleanQuery);

  let rows = facilities
    .filter((facility) => {
      if (type && facility.type !== type) {
        return false;
      }

      if (province && facility.province !== province) {
        return false;
      }

      return true;
    })
    .map((facility) => {
      const hasCoordinates =
        Number.isFinite(facility.lat) &&
        Number.isFinite(facility.lng);

      return {
        ...facility,
        distanceKm: hasCoordinates
          ? distanceKm(origin, {
              lat: facility.lat,
              lng: facility.lng,
            })
          : null,
      };
    });

  if (intent) {
    const serviceMatches = rows.filter((facility) =>
      facility.services?.some((service) =>
        serviceMatchesIntent(service, intent)
      )
    );

    if (serviceMatches.length > 0) {
      rows = serviceMatches;
    }
  } else if (cleanQuery) {
    rows = rows.filter((facility) => {
      const searchableText = [
        facility.name,
        facility.type,
        facility.province,
        facility.district,
        facility.locality,
        facility.address,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(cleanQuery);
    });
  }

  rows.sort((a, b) => {
    if (a.coordinateCaution !== b.coordinateCaution) {
      return a.coordinateCaution ? 1 : -1;
    }

    if (
      a.distanceKm !== null &&
      b.distanceKm !== null
    ) {
      return a.distanceKm - b.distanceKm;
    }

    return a.name.localeCompare(b.name);
  });

  return {
    rows,
    intent,
    hasServiceEvidence: rows.some(
      (facility) => facility.services?.length > 0
    ),
  };
};