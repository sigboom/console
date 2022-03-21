/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'

import DetailPage from 'devops/containers/Base/Detail'
import { trigger } from 'utils/action'
import CDStore from 'stores/cd'
import { observer, inject } from 'mobx-react'
import { get } from 'lodash'
import { getLocalTime } from 'utils'
import routes from './routes'
import StatusText from '../Components/StatusText'

@inject('rootStore')
@observer
@trigger
export default class CDDetail extends React.Component {
  state = {
    showEdit: false,
    showYamlEdit: false,
    deleteModule: false,
    isLoading: true,
  }

  store = new CDStore()

  get listUrl() {
    const { workspace, cluster, devops } = this.props.match.params
    return `/${workspace}/clusters/${cluster}/devops/${devops}/cd`
  }

  get devops() {
    return this.props.match.params.devops
  }

  get cluster() {
    return this.props.match.params.cluster
  }

  get routing() {
    return this.props.rootStore.routing
  }

  fetchData = () => {
    const { params } = this.props.match
    this.store.fetchDetail({ name: params.cd, devops: params.devops })
  }

  componentDidMount() {
    this.fetchData()
  }

  getOperations = () => [
    {
      key: 'edit',
      type: 'control',
      text: t('EDIT'),
      action: 'edit',
      onClick: () => {
        trigger('resource.baseinfo.edit', {
          formTemplate: this.store.detail,
          detail: this.store.detail,
          success: this.getData,
        })
      },
    },
    {
      key: 'sync',
      icon: 'changing-over',
      text: t('Synchronize'),
      action: 'edit',
      onClick: () => {
        this.trigger('cd.sync', {
          title: t('Synchronize'),
          formTemplate: this.store.detail,
          devops: this.devops,
          noCodeEdit: true,
          success: this.getData,
        })
      },
    },
    {
      key: 'editYaml',
      icon: 'pen',
      text: t('EDIT_YAML'),
      action: 'edit',
      onClick: () => {
        this.trigger('resource.yaml.edit', {
          detail: this.store.detail,
          success: this.fetchData,
        })
      },
    },
    {
      key: 'delete',
      icon: 'trash',
      text: t('DELETE'),
      action: 'delete',
      onClick: () => {
        this.trigger('resource.delete', {
          type: 'CD',
          detail: this.store.detail,
          success: () => this.routing.push(this.listUrl),
        })
      },
    },
  ]

  getAttrs = () => {
    const { detail } = this.store

    return [
      {
        name: t('HEALTH_STATUS'),
        value: (
          <StatusText
            type={detail.healthStatus || 'Healthy'}
            label={'Healthy'}
          />
        ),
      },
      {
        name: t('SYNC_STATUS'),
        value: (
          <StatusText type={detail.syncStatus || 'Synced'} label={'Synced'} />
        ),
      },
      {
        name: t('DEPLOY_LOCATION'),
        value: detail.devops,
      },
      {
        name: t('CODE_REPOSITORY_URL'),
        value: get(detail, 'repoSource.repoURL'),
      },
      {
        name: t('REVISE'),
        value: get(detail, 'repoSource.targetRevision'),
      },
      {
        name: t('CODE_RELATIVE_PATH'),
        value: get(detail, 'repoSource.path'),
      },
      {
        name: t('IMAGE'),
        value: detail.image,
      },
      {
        name: t('CREATION_TIME_TCAP'),
        value: getLocalTime(detail.createTime).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        name: t('UPDATE_TIME_SCAP'),
        value: detail.description,
      },
      {
        name: t('CREATED_BY'),
        value: detail.creator,
      },
    ]
  }

  render() {
    const { detail } = this.store
    const stores = { detailStore: this.store }

    const sideProps = {
      module: 'cds',
      name: detail.name,
      desc: detail.description,
      operations: this.getOperations(),
      attrs: this.getAttrs(),
      breadcrumbs: [
        {
          label: t('CD_RESOURCE_PL'),
          url: this.listUrl,
        },
      ],
    }

    return <DetailPage routes={routes} {...sideProps} stores={stores} />
  }
}
