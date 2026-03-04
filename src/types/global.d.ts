/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.

declare module '@radix-ui/react-avatar' {
  export const AvatarRoot: React.ForwardRefExoticComponent<any, any>
  export const AvatarImage: React.ForwardRefExoticComponent<any, any>
  export const AvatarFallback: React.ForwardRefExoticComponent<any, any>
}

declare module '@radix-ui/react-slot' {
  export const Slot: React.ForwardRefExoticComponent<any, any>
}

declare module 'class-variance-authority' {
  export function cva<T>(...args: any[]): any
  export type VariantProps<T> = any
}
