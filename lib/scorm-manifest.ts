import { XMLParser } from "fast-xml-parser";

export type ScormPackageVersion = "v1_2" | "v2004";

export type ScormManifest = {
  entryPoint: string;
  scormVersion: ScormPackageVersion;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  removeNSPrefix: true,
});

export function readScormManifest(xml: string): ScormManifest {
  const parsed = parser.parse(xml) as { manifest?: Manifest };
  const manifest = parsed.manifest;

  if (!manifest) {
    throw new Error("The SCORM package has no manifest.");
  }

  const entryPoint = findEntryPoint(manifest);

  if (!entryPoint) {
    throw new Error("The SCORM package has no start file.");
  }

  return {
    entryPoint,
    scormVersion: findVersion(manifest),
  };
}

type Manifest = {
  metadata?: { schemaversion?: unknown };
  organizations?: { default?: unknown; organization?: unknown };
  resources?: { resource?: unknown };
};

type Resource = {
  identifier?: unknown;
  href?: unknown;
};

function findEntryPoint(manifest: Manifest) {
  const resources = asList(manifest.resources?.resource) as Resource[];
  const organizations = asList(manifest.organizations?.organization);
  const defaultOrg = stringValue(manifest.organizations?.default);
  const organization =
    organizations.find((item) => stringValue(record(item).identifier) === defaultOrg) ??
    organizations[0];
  const identifierRef = organization ? firstIdentifierRef(organization) : undefined;
  const resource = resources.find((item) => stringValue(item.identifier) === identifierRef);
  const href = stringValue(resource?.href) ?? stringValue(resources.find((item) => stringValue(item.href))?.href);

  return cleanHref(href);
}

function findVersion(manifest: Manifest): ScormPackageVersion {
  const schemaVersion = stringValue(manifest.metadata?.schemaversion)?.toLowerCase() ?? "";

  if (schemaVersion.includes("1.2")) {
    return "v1_2";
  }

  if (schemaVersion.includes("2004") || schemaVersion.includes("1.3")) {
    return "v2004";
  }

  return "v1_2";
}

function firstIdentifierRef(value: unknown): string | undefined {
  const item = record(value);
  const own = stringValue(item.identifierref);

  if (own) {
    return own;
  }

  for (const child of asList(item.item)) {
    const found = firstIdentifierRef(child);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function cleanHref(href: string | undefined) {
  if (!href) {
    return undefined;
  }

  const path = href.split("?")[0]?.split("#")[0]?.replaceAll("\\", "/").replace(/^\/+/, "");

  if (!path || path.split("/").some((part) => part === "" || part === "." || part === "..")) {
    return undefined;
  }

  return path;
}

function asList(value: unknown) {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function record(value: unknown) {
  if (typeof value === "object" && value !== null) {
    return value as Record<string, unknown>;
  }

  return {};
}

function stringValue(value: unknown) {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}
