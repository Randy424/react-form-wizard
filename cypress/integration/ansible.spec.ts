/// <reference types="cypress" />
import YAML from 'yaml'

describe('ansible wizard', () => {
    const expected = {
        apiVersion: 'cluster.open-cluster-management.io/v1beta1',
        kind: 'ClusterCurator',
        metadata: {
            name: 'my-ansible-autmation-template',
            namespace: 'default',
        },
        spec: {
            install: {
                towerAuthSecret: 'my-ansible-creds',
                prehook: [
                    {
                        name: 'pre-install-name',
                        extra_vars: {
                            'pre-install-variable': 'pre-install-value',
                        },
                    },
                ],
                posthook: [
                    {
                        name: 'post-install-name',
                        extra_vars: {
                            'post-install-variable': 'post-install-value',
                        },
                    },
                ],
            },
            upgrade: {
                towerAuthSecret: 'my-ansible-creds',
                prehook: [
                    {
                        name: 'pre-upgrade-name',
                        extra_vars: {
                            'pre-upgrade-variable': 'pre-upgrade-value',
                        },
                    },
                ],
                posthook: [
                    {
                        name: 'post-upgrade-name',
                        extra_vars: {
                            'post-upgrade-variable': 'post-upgrade-value',
                        },
                    },
                ],
            },
        },
    }

    it('displays', () => {
        cy.visit('http://localhost:3000/?route=ansible')
        cy.get('h1').contains('Create Ansible automation template')
    })

    it('details', () => {
        cy.get('#name').type(expected.metadata.name)
        cy.get('#namespace-form-group')
            .click()
            .get('#' + expected.metadata.namespace)
            .click()
        cy.contains('Next').click()
    })

    it('install', () => {
        cy.get('#spec\\.install\\.towerAuthSecret-form-group').click().get('#my-ansible-creds').click()

        cy.get('#install-prehooks').within(() => {
            cy.contains('Add job template').click()
            cy.get('#name').type('pre-install-name')
            cy.contains('Add variable').click()
            cy.get('#extra_vars').within(() => {
                cy.get('#key').type('pre-install-variable')
                cy.get('#value').type('pre-install-value')
            })
        })

        cy.get('#install-posthooks').within(() => {
            cy.contains('Add job template').click()
            cy.get('#name').type('post-install-name')
            cy.contains('Add variable').click()
            cy.get('#extra_vars').within(() => {
                cy.get('#key').type('post-install-variable')
                cy.get('#value').type('post-install-value')
            })
        })

        cy.contains('Next').click()
    })

    it('upgrade', () => {
        cy.get('#spec\\.upgrade\\.towerAuthSecret-form-group').click().get('#my-ansible-creds').click()

        cy.get('#upgrade-prehooks').within(() => {
            cy.contains('Add job template').click()
            cy.get('#name').type('pre-upgrade-name')
            cy.contains('Add variable').click()
            cy.get('#extra_vars').within(() => {
                cy.get('#key').type('pre-upgrade-variable')
                cy.get('#value').type('pre-upgrade-value')
            })
        })

        cy.get('#upgrade-posthooks').within(() => {
            cy.contains('Add job template').click()
            cy.get('#name').type('post-upgrade-name')
            cy.contains('Add variable').click()
            cy.get('#extra_vars').within(() => {
                cy.get('#key').type('post-upgrade-variable')
                cy.get('#value').type('post-upgrade-value')
            })
        })

        cy.contains('Next').click()
    })

    it('summary', () => {
        cy.get('#name').contains(expected.metadata.name)
        cy.get('#namespace').contains(expected.metadata.namespace)

        cy.contains('Submit').click()
    })

    it('results', () => {
        const yaml = YAML.stringify(expected)
        cy.get('pre').should('have.text', yaml)
    })
})
