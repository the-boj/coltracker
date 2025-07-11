/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { Route as rootRouteImport } from './routes/__root'
import { Route as CategoryRouteImport } from './routes/category'
import { Route as IndexRouteImport } from './routes/index'
import { Route as CategoriesCategoryIdRouteImport } from './routes/categories.$categoryId'

const CategoryRoute = CategoryRouteImport.update({
  id: '/category',
  path: '/category',
  getParentRoute: () => rootRouteImport,
} as any)
const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const CategoriesCategoryIdRoute = CategoriesCategoryIdRouteImport.update({
  id: '/categories/$categoryId',
  path: '/categories/$categoryId',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/category': typeof CategoryRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/category': typeof CategoryRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/category': typeof CategoryRoute
  '/categories/$categoryId': typeof CategoriesCategoryIdRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/category' | '/categories/$categoryId'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/category' | '/categories/$categoryId'
  id: '__root__' | '/' | '/category' | '/categories/$categoryId'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  CategoryRoute: typeof CategoryRoute
  CategoriesCategoryIdRoute: typeof CategoriesCategoryIdRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/category': {
      id: '/category'
      path: '/category'
      fullPath: '/category'
      preLoaderRoute: typeof CategoryRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexRouteImport
      parentRoute: typeof rootRouteImport
    }
    '/categories/$categoryId': {
      id: '/categories/$categoryId'
      path: '/categories/$categoryId'
      fullPath: '/categories/$categoryId'
      preLoaderRoute: typeof CategoriesCategoryIdRouteImport
      parentRoute: typeof rootRouteImport
    }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  CategoryRoute: CategoryRoute,
  CategoriesCategoryIdRoute: CategoriesCategoryIdRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()
