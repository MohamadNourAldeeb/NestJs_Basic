import { Transform, TransformFnParams } from 'class-transformer';

export function Trim() {
  return Transform(({ value }: TransformFnParams) => {
    if (value === null || value === undefined) return value;
    return typeof value === 'string' ? value.trim() : value;
  });
}
