/**
 * Value written back when a queryable select or input changes.
 */

export function selectParameterValue(
  type: string | undefined,
  previous: unknown,
  newValue: unknown
): number | string | string[] | undefined {
  let selected: number | string | string[] | undefined;
  if (typeof newValue === 'string' || typeof newValue === 'number') {
    selected = newValue;
  } else if (Array.isArray(newValue)) {
    selected = newValue.map(item => {
      if (typeof item === 'string') {
        return item;
      }
      if (item && typeof item === 'object' && 'value' in item) {
        const value = (item as { value: unknown }).value;
        if (typeof value === 'string') {
          return value;
        }
      }
      throw new Error('Invalid value type ' + typeof item);
    });
  } else if (newValue && typeof newValue === 'object' && 'value' in newValue) {
    const value = (newValue as { value: unknown }).value;
    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new Error('Invalid value type ' + typeof value);
    }
    selected = value;
  } else if (newValue === null) {
    selected = undefined;
  } else {
    throw new Error('Invalid value type ' + typeof newValue);
  }

  // List defaults must stay lists: one chosen option is a string.
  const keepList = type === 'array' || Array.isArray(previous);
  if (keepList && selected !== undefined && !Array.isArray(selected)) {
    selected = [String(selected)];
  }
  return selected;
}
