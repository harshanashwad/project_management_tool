import graphene
from graphene_django import DjangoObjectType
from .models import Organization


class OrganizationType(DjangoObjectType):
    """GraphQL type for Organization model"""
    project_count = graphene.Int()

    class Meta:
        model = Organization
        fields = ('id', 'name', 'slug', 'contact_email', 'created_at')

    def resolve_project_count(self, info):
        # Count projects for this org
        return self.projects.count()


class Query(graphene.ObjectType):
    organization = graphene.Field(OrganizationType, slug=graphene.String(required=True))
    organizations = graphene.List(OrganizationType)

    def resolve_organization(self, info, slug):
        try:
            return Organization.objects.get(slug=slug)
        except Organization.DoesNotExist:
            return None

    def resolve_organizations(self, info):
        return Organization.objects.all()


class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    success = graphene.Boolean()
    organization = graphene.Field(OrganizationType)
    errors = graphene.List(graphene.String)

    def mutate(self, info, name, contact_email):
        try:
            # Basic email validation
            if '@' not in contact_email:
                return CreateOrganization(
                    success=False,
                    organization=None,
                    errors=["Invalid email format"]
                )

            org = Organization.objects.create(
                name=name,
                contact_email=contact_email
            )

            return CreateOrganization(
                success=True,
                organization=org,
                errors=None
            )
        except Exception as e:
            return CreateOrganization(
                success=False,
                organization=None,
                errors=[str(e)]
            )


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
