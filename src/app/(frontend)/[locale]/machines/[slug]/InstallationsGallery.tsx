import Image from 'next/image'
import type { MachineInstallation, Media, Partner } from '@/payload-types'

type Props = {
  installations: MachineInstallation[]
}

export const InstallationsGallery: React.FC<Props> = ({ installations }) => {
  if (installations.length === 0) return null

  return (
    <section className="ak-family-detail__installations">
      <div className="bp-content-grid">
        <div className="content ak-family-detail__installations-inner">
          <p className="ak-machine-detail__related-eyebrow">REAL INSTALLATIONS</p>
          <h2 className="ak-machine-detail__related-heading">Trusted by real venues.</h2>

          <div className="ak-family-detail__installations-grid">
            {installations.map((installation) => {
              const client =
                typeof installation.client === 'object' ? (installation.client as Partner) : null
              const logo = typeof client?.logo === 'object' ? (client?.logo as Media) : null
              const firstPhoto = installation.photos?.[0]
              const photo =
                firstPhoto && typeof firstPhoto.image === 'object'
                  ? (firstPhoto.image as Media)
                  : null

              return (
                <div
                  key={installation.id}
                  className="ak-family-detail__installation-card"
                >
                  {photo?.url && (
                    <div className="ak-family-detail__installation-photo">
                      <Image
                        src={photo.url}
                        alt={client?.name ?? ''}
                        fill
                        className="ak-family-detail__installation-img"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                  )}
                  <div className="ak-family-detail__installation-body">
                    {logo?.url && (
                      <div className="ak-family-detail__installation-logo">
                        <Image
                          src={logo.url}
                          alt={client?.name ?? ''}
                          fill
                          className="ak-family-detail__installation-logo-img"
                          sizes="120px"
                        />
                      </div>
                    )}
                    {client?.name && (
                      <p className="ak-family-detail__installation-name">{client.name}</p>
                    )}
                    {installation.location && (
                      <p className="ak-family-detail__installation-location">
                        {installation.location}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
