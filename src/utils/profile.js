export function hasProfileNote(value) {
  return Boolean(String(value || '').trim() && !['none', 'no', 'n/a', 'na'].includes(String(value).trim().toLowerCase()))
}
