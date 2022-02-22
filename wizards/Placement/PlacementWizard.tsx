import { EditMode, Step, WizardCancel, WizardPage, WizardSubmit } from '../../src'
import { IResource } from '../common/resource'
import { IClusterSetBinding } from './ClusterSetBinding'
import { PlacementSection } from './PlacementSection'

export function PlacementWizard(props: {
    title: string
    namespaces: string[]
    policies: IResource[]
    placements: IResource[]
    placementRules: IResource[]
    clusterSetBindings: IClusterSetBinding[]
    editMode?: EditMode
    resources?: IResource[]
    onSubmit: WizardSubmit
    onCancel: WizardCancel
}) {
    return (
        <WizardPage
            title={props.title}
            onSubmit={props.onSubmit}
            onCancel={props.onCancel}
            editMode={props.editMode}
            defaultData={props.resources ?? []}
        >
            <Step label="Cluster placement" id="placement">
                <PlacementSection
                    placements={props.placements}
                    placementRules={props.placementRules}
                    clusterSetBindings={props.clusterSetBindings}
                    bindingSubjectKind="Policy"
                    bindingSubjectApiGroup="policy.open-cluster-management.io"
                />
            </Step>
        </WizardPage>
    )
}
