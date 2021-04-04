import { Document, DocumentQuery } from 'mongoose';
import { PaginationArgs } from '../types/pagination-args.type';

export async function buildQuery<T, D extends Document>(
  params: PaginationArgs,
  document: DocumentQuery<T, D>
): Promise<any> {
  console.log({ params });
  if ('searchableFields' in params && 'q' in params && params.q !== '') {
    const cond: any[] = [];
    for (let i = 0; i < params.searchableFields.length; i++) {
      let search: string | object = params.q;
      if ('regexSearch' in params && params.regexSearch) {
        search = { $regex: params.q, $options: 'ig' };
        console.log({search})
      }

      cond.push({ [params.searchableFields[i]]: search });
    }
    if (cond.length) {
      console.log({ cond });
      document.or(cond);
    }
  }

  const DocumentModel = document.toConstructor();
  // document.sort({ [params.sort_field]: params.sort_dir === 'asc' ? 1 : -1 });

  document
    .skip(+params.skip * params.take)
    .limit(params.take <= 30 ? +params.take : 30);

  const [items, total] = await Promise.all([
    document.exec(),
    new DocumentModel().countDocuments().exec(),
  ]);

  return {
    items,
    total,
  };
}
