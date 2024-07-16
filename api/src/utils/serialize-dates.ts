export function serializeDates(comment: any) {
  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    children:
      comment.children && comment.children.length > 0
        ? comment.children.map(serializeDates)
        : [],
  };
}

export function deserializeDates(comment: any) {
  return {
    ...comment,
    createdAt: new Date(comment.createdAt),
    children:
      comment.children && comment.children.length > 0
        ? comment.children.map(deserializeDates)
        : [],
  };
}
