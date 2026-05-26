const DEFAULT_IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'target',
  'dist',
  'build',
  '.next',
  '.turbo',
]);

const SENSITIVE_FILE_NAMES = new Set([
  '.env',
  'id_rsa',
  'credentials.json',
]);

const SENSITIVE_EXTENSIONS = ['.pem', '.key', '.p12', '.sqlite', '.db'];

export function shouldIndexPath(pathParts: string[]) {
  return !pathParts.some((part) => DEFAULT_IGNORED_DIRS.has(part));
}

export function isSensitiveFile(fileName: string) {
  const normalized = fileName.toLowerCase();
  return (
    SENSITIVE_FILE_NAMES.has(normalized) ||
    SENSITIVE_EXTENSIONS.some((extension) => normalized.endsWith(extension))
  );
}

export function canSendFileToCloud(fileName: string) {
  return !isSensitiveFile(fileName);
}

