export type Branded<T, Brand extends string> = T & { readonly __brand: Brand }

export type UserId = Branded<string, 'UserId'>
