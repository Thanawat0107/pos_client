import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { baseUrlAPI } from "../helpers/SD";
import type { Recipe } from "../@types/dto/Recipe";
import type { ApiResponse } from "../@types/Responsts/ApiResponse";
import type { PaginationMeta } from "../@types/Responsts/PaginationMeta";
import { unwrapResult } from "../helpers/res";
import type { CreateRecipe } from "../@types/createDto/CreateRecipe";
import type { UpdateRecipe } from "../@types/UpdateDto/UpdateRecipe";

export const recipesApi = createApi({
    reducerPath: "recipesApi",
    baseQuery: fetchBaseQuery({
        baseUrl: baseUrlAPI,
    }),
    tagTypes: ["Recipe"],
    endpoints: (builder) => ({
        getRecipes: builder.query<
            { result: Recipe[]; meta: PaginationMeta },
            { pageNumber?: number; pageSize?: number }
        >({
            query: (params) => ({
                url: "recipes/getall",
                method: "GET",
                params,
            }),
            transformResponse: (
                response: ApiResponse<Recipe[]>
            ) => ({
                result: response.result ?? [],
                meta: response.meta as PaginationMeta,
            }),
            providesTags: ["Recipe"],
        }),

        getRecipeById: builder.query<Recipe, number>({
            query: (id) => `recipes/getby/${id}`,
            transformResponse: unwrapResult<Recipe>,
            providesTags: (_result, _error, id) => [{ type: "Recipe", id }],
        }),

        createRecipe: builder.mutation<Recipe, CreateRecipe>({
            query: (body) => ({
                url: "recipes/create",
                method: "POST",
                body,
            }),
            transformResponse: unwrapResult<Recipe>,
            invalidatesTags: ["Recipe"],
        }),

        updateRecipe: builder.mutation<
            Recipe,
            { id: number; data: UpdateRecipe }
        >({
            query: ({ id, data }) => ({
                url: `recipes/update/${id}`,
                method: "PUT",
                body: data,
            }),
            transformResponse: unwrapResult<Recipe>,
            invalidatesTags: ["Recipe"],
        }),

        deleteRecipe: builder.mutation<void, number>({
            query: (id) => ({
                url: `recipes/delete/${id}`,
                method: "DELETE",
            }),
            transformResponse: (response: ApiResponse<unknown>) => {
                if (!response.isSuccess) {
                    throw new Error(response.message || "Delete failed");
                }
                return;
            },
            invalidatesTags: ["Recipe"],
        }),
    }),
});

export const {
        useGetRecipesQuery,
        useGetRecipeByIdQuery,
        useCreateRecipeMutation,
        useUpdateRecipeMutation,
        useDeleteRecipeMutation,
} = recipesApi;