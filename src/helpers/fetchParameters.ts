export const fetchRawData = async (
  provider: string,
  productType: any
): Promise<any[]> => {
  console.log(provider);
  console.log(productType);

  const filepath = '/files/temp/AGGREGATE.json';
  // TODO: - Edit lines below to adapt to API

  try {
    const response = await fetch(filepath);
    if (!response.ok) {
      throw new Error(`Erreur : impossible de trouver le fichier ${filepath}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers JSON :', error);
    throw error;
  }
};

export const determineMandatoryProperties = (
  data: any
): { key: string; value: unknown; mandatory: boolean }[] => {
  const { properties, required } = data;

  if (!properties) {
    throw new Error("Erreur : 'properties' est manquant dans le schéma.");
  }

  const uselessKeyToWithdraw = [
    'start_datetime',
    'end_datetime',
    'year',
    'month',
    'day',
    'time',
    'datetime',
    'geometry',
    'bbox'
  ];

  const result = Object.entries(properties)
    .map(([key, value]) => {
      if (uselessKeyToWithdraw.includes(key)) return null; // remove useless key items

      const mandatory = required ? required.includes(key) : false;
      return { key, value, mandatory };
    })
    .filter(value => value !== null)
    .sort((a, b) => {
      return a.mandatory === b.mandatory ? 0 : a.mandatory ? -1 : 1;
    }); // Sort by mandatory items
  return result;
};

export const isAdditionalParameters = (data: any): boolean => {
  return data?.additionalProperties ? data.additionalProperties : false;
};
