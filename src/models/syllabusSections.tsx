import { openDB } from 'idb';
import { SYLLABUS_SECTIONS_STORE, DB_NAME } from './initDB';
import { syllabusSectionSchema } from './schema';

interface SyllabusSection {
  id?: string;
  serialNumber: number;
  unitName: string;
  title: string;
  minWeightage: number;
  maxWeightage: number;
  questionsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

// Validate and set defaults for a syllabus section
function validateAndSetDefaults(
  section: Partial<SyllabusSection>,
): SyllabusSection {
  const validatedSection: SyllabusSection = {} as SyllabusSection;

  Object.keys(syllabusSectionSchema).forEach((key) => {
    const value = syllabusSectionSchema[key];
    if (key in section) {
      if (value.validate && !value.validate(section[key])) {
        throw new Error(`Invalid value for ${key}`);
      }
      validatedSection[key] = section[key];
    } else if ('default' in value) {
      validatedSection[key] =
        typeof value.default === 'function' ? value.default() : value.default;
    } else {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  return validatedSection;
}

// Add a new syllabus section
export async function addSyllabusSection(
  section: Partial<SyllabusSection>,
): Promise<string> {
  const db = await openDB(DB_NAME);
  const validatedSection = validateAndSetDefaults(section);
  const id = await db.add(SYLLABUS_SECTIONS_STORE, validatedSection);
  return id.toString();
}

// Get a syllabus section by ID
export async function getSyllabusSection(
  id: string,
): Promise<SyllabusSection | undefined> {
  const db = await openDB(DB_NAME);
  return db.get(SYLLABUS_SECTIONS_STORE, id);
}

// Update a syllabus section
export async function updateSyllabusSection(
  id: string,
  updates: Partial<SyllabusSection>,
): Promise<void> {
  const db = await openDB(DB_NAME);
  const existingSection = await db.get(SYLLABUS_SECTIONS_STORE, id);
  if (!existingSection) {
    throw new Error('Syllabus section not found');
  }
  const updatedSection = {
    ...existingSection,
    ...updates,
    updatedAt: new Date(),
  };
  const validatedSection = validateAndSetDefaults(updatedSection);
  await db.put(SYLLABUS_SECTIONS_STORE, validatedSection);
}

// Delete a syllabus section
export async function deleteSyllabusSection(id: string): Promise<void> {
  const db = await openDB(DB_NAME);
  await db.delete(SYLLABUS_SECTIONS_STORE, id);
}

// Get all syllabus sections
export async function getAllSyllabusSections(): Promise<SyllabusSection[]> {
  const db = await openDB(DB_NAME);
  return db.getAll(SYLLABUS_SECTIONS_STORE);
}
