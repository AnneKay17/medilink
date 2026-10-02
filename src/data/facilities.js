const FACILITIES_URL = `${import.meta.env.BASE_URL}facilities.json`;

export const getFacilities = async () => {
  const response = await fetch(FACILITIES_URL);

  if (!response.ok) {
    throw new Error('Unable to load healthcare facilities.');
  }

  const data = await response.json();

  return data.facilities || [];
};

export const getFacilityById = async (facilityId) => {
  const facilities = await getFacilities();

  return facilities.find((facility) => facility.id === facilityId);
};