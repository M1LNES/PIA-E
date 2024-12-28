import { CategoryDomain } from '@/dto/types'

/* DTO for returning all categories */
export type DbCategory = {
	id: number
	name: string
}

/**
 * Mapuje databázový objekt kategorie na doménový objekt.
 * @param dbCategory Objekt kategorie z databáze.
 * @returns Doménový objekt kategorie.
 */
function mapDbCategoryToDomain(dbCategory: DbCategory): CategoryDomain {
	return {
		categoryId: dbCategory.id,
		categoryName: dbCategory.name,
	}
}

export function mapDbCategoriesToDomain(
	dbCategories: DbCategory[]
): CategoryDomain[] {
	return dbCategories.map(mapDbCategoryToDomain)
}
