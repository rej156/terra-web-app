import { useRouteMatch } from "react-router-dom"

import { LP, MIR } from "../../constants"
import { minus, gt, number } from "../../libs/math"
import { percent } from "../../libs/num"
import { useRefetch } from "../../hooks"
import { useContract, useContractsAddress } from "../../hooks"
import { BalanceKey, AssetInfoKey } from "../../hooks/contractKeys"
import useAssetStats from "../../statistics/useAssetStats"

import Grid from "../../components/Grid"
import StakeItemCard from "../../components/StakeItemCard"
import LoadingTitle from "../../components/LoadingTitle"
import Count from "../../components/Count"
import CountWithResult from "../../containers/CountWithResult"

import StakeListTitle from "./StakeListTitle"
import styles from "./StakeList.module.scss"

const StakeList = () => {
  const keys = [BalanceKey.LPSTAKED, BalanceKey.LPSTAKABLE]
  const { url } = useRouteMatch()
  const { loading } = useRefetch(keys)

  /* context */
  const { listed, getSymbol } = useContractsAddress()
  const { find } = useContract()
  const stats = useAssetStats()
  const { apr } = stats

  const getItem = ({ token }: ListedItem) => {
    const apr = stats["apr"][token] ?? "0"
    const symbol = getSymbol(token)

    return {
      token,
      symbol,
      staked: gt(find(BalanceKey.LPSTAKED, token), 0),
      stakable: gt(find(BalanceKey.LPSTAKABLE, token), 0),
      apr: <Count format={percent}>{apr}</Count>,
      totalStaked: (
        <CountWithResult
          keys={[AssetInfoKey.LPTOTALSTAKED]}
          symbol={LP}
          integer
        >
          {find(AssetInfoKey.LPTOTALSTAKED, token)}
        </CountWithResult>
      ),
      to: `${url}/${token}`,
      emphasize: symbol === MIR,
    }
  }

  return (
    <article>
      <LoadingTitle className={styles.encourage} loading={loading}>
        <StakeListTitle />
      </LoadingTitle>

      <Grid wrap={3}>
        {listed
          .map(getItem)
          .sort(
            ({ symbol: a }, { symbol: b }) =>
              Number(b === "MIR") - Number(a === "MIR")
          )
          .sort(({ token: a }, { token: b }) => number(minus(apr[b], apr[a])))
          .map((item) => (
            <StakeItemCard {...item} key={item.token} />
          ))}
      </Grid>
    </article>
  )
}

export default StakeList
