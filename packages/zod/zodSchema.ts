import { z } from "zod";

export const SignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(["user", "admin"]),
});

export const SigninSchema = z.object({
  username: z.string(),
  password: z.string(),
});


export const createSpaceSchema = z.object({
  name: z.string(),
  dimension: z.string(),
  thumbnail: z.string(),
  mapId : z.string().optional()
});

export const deleteSpaceElementSchema = z.object({
    id : z.string()
})

export const createElementSchema = z.object({
  imageUrl : z.string(),
  width : z.number(),
  height : z.number(),
  static : z.boolean()
})

export const UpdateElementSchema = z.object({
   imageUrl : z.string()
})

export const createAvatarSchema = z.object({
  imageUrl : z.string(),
  name : z.string()
})

export const createMapSchema = z.object({
   thumbnail : z.string(),
   dimension : z.string(),
   name : z.string(),
   defaultElements :z.array(z.object({
    elementId : z.string(),
    x: z.string(),
    y : z.string()
   }))
})

// Put the element in the space 
export const placedElementsSchema = z.object({
   elementId : z.string(),
   spaceId : z.string(),
   x : z.number(),
   y : z.number()
})

export const deleteElementSchema = z.object({
    id : z.string()
})

export const updatemetadataSchema = z.object({
    avatarId  : z.string()
})