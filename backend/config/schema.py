import graphene

import apps.organizations.schema
import apps.projects.schema
import apps.tasks.schema


class Query(
    apps.organizations.schema.Query,
    apps.projects.schema.Query,
    apps.tasks.schema.Query,
    graphene.ObjectType
):
    # Combine all queries from different apps
    pass


class Mutation(
    apps.organizations.schema.Mutation,
    apps.projects.schema.Mutation,
    apps.tasks.schema.Mutation,
    graphene.ObjectType
):
    # Combine all mutations from different apps
    pass


schema = graphene.Schema(query=Query, mutation=Mutation)
