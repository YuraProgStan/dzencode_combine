/**
 * Produces a GraphQLError representing a syntax error, containing useful
 * descriptive information about the syntax error's position in the source.
 */
import { GraphQLError } from "graphql/error";


export function syntaxError(source, position, description) {
    return new GraphQLError(`Syntax Error: ${description}`, {
        source,
        positions: [position],
    });
}