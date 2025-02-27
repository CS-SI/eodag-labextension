export const fetchRawData = async (): Promise<any[]> => {
  const filepaths = [
    '/files/temp/DT_CLIMATE_ADAPTATION.json',
    '/files/temp/ERA5_SL.json',
    '/files/temp/S2_MSI_L1C.json'
  ];

  try {
    const contents = await Promise.all(
      filepaths.map(async filepath => {
        const response = await fetch(filepath);
        if (!response.ok) {
          throw new Error(
            `Erreur : impossible de trouver le fichier ${filepath}`
          );
        }
        return await response.json();
      })
    );

    return contents;
  } catch (error) {
    console.error('Erreur lors de la récupération des fichiers JSON :', error);
    throw error;
  }
};

export const determineIfMandatory = (
  data: any
): [string, any, { mandatory: boolean }][] => {
  const { properties, required } = data;

  if (!properties) {
    throw new Error("Erreur : 'properties' est manquant dans le schéma.");
  }

  const result = Object.entries(properties).map(([key, value]) => {
    const mandatory = required ? required.includes(key) : false;
    return [key, value, { mandatory }] as [string, any, { mandatory: boolean }];
  });
  return result;
};

// remove Geometry / start_datetime / end_datetime
