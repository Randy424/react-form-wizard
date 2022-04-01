import { Alert, Button, ButtonVariant } from '@patternfly/react-core'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import { DetailsHidden, EditMode, KeyValue, Section, Select, Step, WizardCancel, WizardPage, WizardSubmit } from '../../src'
import { IResource } from '../common/resource'
import { ICredential } from '../common/resources/ICredential'
import { IPolicyAutomation, PolicyAutomationType } from '../common/resources/IPolicyAutomation'

export function PolicyAutomationWizard(props: {
    title: string
    breadcrumb?: { label: string; to?: string }[]
    policy: IResource
    credentials: IResource[]
    createCredentialsCallback: () => void
    editMode?: EditMode
    yamlEditor?: () => ReactNode
    resource: IPolicyAutomation
    onSubmit: WizardSubmit
    onCancel: WizardCancel
    getAnsibleJobsCallback: (credential: ICredential) => Promise<string[]>
}) {
    const ansibleCredentials = useMemo(
        () => props.credentials.filter((credential) => credential.metadata?.labels?.['cluster.open-cluster-management.io/type'] === 'ans'),
        [props.credentials]
    )
    const ansibleCredentialNames = useMemo(
        () => ansibleCredentials.map((credential) => credential.metadata?.name ?? ''),
        [ansibleCredentials]
    )
    const [jobNames, setJobNames] = useState<string[]>()
    const [alert, setAlert] = useState<{ title: string; message: string }>()

    useEffect(() => {
        if (props.editMode === EditMode.Edit) {
            const credential = ansibleCredentials.find(
                (credential) => credential.metadata?.name === props.resource.spec.automationDef.secret
            )
            props
                .getAnsibleJobsCallback(credential ?? {})
                .then((jobNames) => setJobNames(jobNames))
                .catch((err) => {
                    if (err instanceof Error) {
                        setAlert({ title: 'Failed to get job names from ansible', message: err.message })
                    } else {
                        setAlert({ title: 'Failed to get job names from ansible', message: 'Unknown error' })
                    }
                })
        }
    }, [ansibleCredentials, props])

    return (
        <WizardPage
            title={props.title}
            breadcrumb={props.breadcrumb}
            onSubmit={props.onSubmit}
            onCancel={props.onCancel}
            editMode={props.editMode}
            yamlEditor={props.yamlEditor}
            defaultData={
                props.resource ?? {
                    ...PolicyAutomationType,
                    metadata: {
                        name: `${props.policy.metadata?.name ?? ''}-policy-automation`,
                        namespace: props.policy.metadata?.namespace,
                    },
                    spec: {
                        policyRef: props.policy.metadata?.name,
                        mode: 'once',
                        automationDef: { name: '', secret: '', type: 'AnsibleJob' },
                    },
                }
            }
        >
            <Step label="Automation" id="automation-step">
                <Section label="Policy automation">
                    {alert && (
                        <DetailsHidden>
                            <Alert title={alert.title} isInline variant="danger">
                                {alert.message}
                            </Alert>
                        </DetailsHidden>
                    )}
                    <Select
                        id="secret"
                        label="Ansible credential"
                        path="spec.automationDef.secret"
                        options={ansibleCredentialNames}
                        onValueChange={(value, item) => {
                            if ((item as IPolicyAutomation).spec?.automationDef?.name) {
                                ;(item as IPolicyAutomation).spec.automationDef.name = ''
                            }
                            const credential = ansibleCredentials.find((credential) => credential.metadata?.name === value)
                            if (credential) {
                                setAlert(undefined)
                                setJobNames(undefined)
                                props
                                    .getAnsibleJobsCallback(credential)
                                    .then((jobNames) => setJobNames(jobNames))
                                    .catch((err) => {
                                        if (err instanceof Error) {
                                            setAlert({ title: 'Failed to get job names from ansible', message: err.message })
                                        } else {
                                            setAlert({ title: 'Failed to get job names from ansible', message: 'Unknown error' })
                                        }
                                    })
                            }
                        }}
                        footer={
                            <>
                                <Button
                                    id={'create-credential'}
                                    isInline
                                    variant={ButtonVariant.link}
                                    onClick={props.createCredentialsCallback}
                                >
                                    {'Create credential'}
                                </Button>
                            </>
                        }
                        required
                    />
                    <Select
                        id="job"
                        label="Ansible job"
                        path="spec.automationDef.name"
                        options={jobNames}
                        hidden={(item) => !item.spec.automationDef.secret}
                        required
                    />
                    <KeyValue
                        id="extra_vars"
                        path="spec.automationDef.extra_vars"
                        label="Extra variables"
                        placeholder="Add variable"
                        hidden={(item) => !item.spec.automationDef.name}
                    />
                    <Select
                        id="mode"
                        label="Schedule"
                        path="spec.mode"
                        options={[
                            { label: 'Once', value: 'once' },
                            { label: 'Disabled', value: 'disabled' },
                            { label: 'Manual', value: 'manual' }, // value is actually disabled but will be handled in onValueChange
                        ]}
                        hidden={(item) => !item.spec.automationDef.name}
                        required
                        onValueChange={(value, item) => {
                            // Manual mode sets mode to disabled & includes the addition of annotation: 'policy.open-cluster-management.io/rerun': true
                            if (value === 'manual' && !item.metadata.annotations) {
                                item.spec.mode = 'disabled'
                                item.metadata.annotations = {
                                    'policy.open-cluster-management.io/rerun': true,
                                }
                            } else if (value !== 'manual' && item.metadata.annotations) {
                                delete item.metadata.annotations
                            }
                        }}
                    />
                </Section>
            </Step>
        </WizardPage>
    )
}
