import { ArgsType, Field, Int, ObjectType } from 'type-graphql';

@ArgsType()
export class PaginationArgs {
  @Field((type) => Int, { defaultValue: 0 })
  skip: number;

  @Field((type) => Int, { defaultValue: 10 })
  take: number;

  @Field({ nullable: true })
  q?: string;

  @Field({ defaultValue: false })
  regexSearch: boolean;

  searchableFields: string[];
}

export function PaginatedResponse<TItem>(TItemClass: TItem) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    // here we use the runtime argument
    @Field((type) => [TItemClass])
    // and here the generic type
    items: TItem[];

    @Field((type) => Int)
    total: number;
  }

  return PaginatedResponseClass;
}
