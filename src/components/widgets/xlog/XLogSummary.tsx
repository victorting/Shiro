import { useQuery } from '@tanstack/react-query'
import type { FC, ReactNode } from 'react'

import { AutoResizeHeight } from '~/components/widgets/shared/AutoResizeHeight'
import { clsxm } from '~/lib/helper'
import { useCurrentNoteDataSelector } from '~/providers/note/CurrentNoteDataProvider'
import { useCurrentPostDataSelector } from '~/providers/post/CurrentPostDataProvider'

const XLogSummary: FC<{
  cid: string
  className?: string
}> = (props) => {
  const { cid } = props
  const { data, isLoading, error } = useQuery(
    [`getSummary`, cid],
    async ({ queryKey }) => {
      const [, cid] = queryKey
      const data = await fetch(`/api/xlog/summary?cid=${cid}`, {
        next: {
          revalidate: 60 * 10,
        },
      }).then((res) => res.json())
      if (!data) throw new Error('请求错误')
      if (!data.data) throw new Error('内容暂时无法获取')
      return data
    },
    {
      enabled: !!cid,
      staleTime: 1000 * 60 * 60 * 24 * 7,
      retryDelay: 5000,
    },
  )

  let Inner: ReactNode = (
    <div
      data-hide-print
      className={clsxm(
        `space-y-2 rounded-xl border border-slate-200 p-4 dark:border-neutral-800`,
        props.className,
      )}
    >
      <div className="flex items-center">
        <i className="icon-[mingcute--sparkles-line] mr-2 text-lg" />
        AI 生成的摘要
      </div>

      <AutoResizeHeight duration={0.3}>
        <p className="text-base-content/85 !m-0 text-sm leading-loose">
          {isLoading ? '加载中...' : error ? '请求错误' : data?.data}
        </p>
        {isLoading && (
          <p className="border-slate-200 text-right text-sm dark:border-slate-800 ">
            (此服务由{' '}
            <a href="https://xlog.app" target="_blank" rel="noreferrer">
              xLog
            </a>{' '}
            驱动)
          </p>
        )}
      </AutoResizeHeight>
    </div>
  )
  console.log(data, cid)

  if (!cid || !data?.data) {
    Inner = null
  }

  return (
    <AutoResizeHeight duration={0.2} className="mt-4">
      {Inner}
    </AutoResizeHeight>
  )
}

export const XLogSummaryForPost: FC = () => {
  const cid = useCurrentPostDataSelector((data) => data?.meta?.xLog?.cid)

  if (!cid) return null

  return <XLogSummary cid={cid} className="mb-4" />
}

export const XLogSummaryForNote: FC = () => {
  const cid = useCurrentNoteDataSelector((data) => data?.data.meta?.xLog?.cid)

  if (!cid) return null

  return <XLogSummary cid={cid} />
}
