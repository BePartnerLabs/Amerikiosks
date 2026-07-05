import type { Block } from 'payload'

export const MachinesListing: Block = {
  slug: 'machinesListing',
  interfaceName: 'MachinesListingBlock',
  imageURL: '/block-previews/machines-listing.png',
  imageAltText: 'Machines Listing block — filterable, paginated machine card grid',
  labels: { singular: 'Machines Listing', plural: 'Machines Listings' },
  fields: [
    {
      name: 'itemsPerPage',
      type: 'number',
      defaultValue: 12,
      admin: { description: 'How many machines to show per page.' },
    },
  ],
}
