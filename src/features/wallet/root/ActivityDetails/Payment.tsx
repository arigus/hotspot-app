import React from 'react'
import {
  AnyTransaction,
  PendingTransaction,
  PaymentV1,
  PaymentV2,
} from '@helium/http'
import Balance, { NetworkTokens } from '@helium/currency'
import Box from '../../../../components/Box'
import Text from '../../../../components/Text'
import { isPayer } from '../../../../utils/transactions'
import PaymentItem from './PaymentItem'

type Props = { item: AnyTransaction | PendingTransaction; address: string }
const Payment = ({ item, address }: Props) => {
  if (item.type !== 'payment_v1' && item.type !== 'payment_v2') return null

  const v1 = (item as unknown) as PaymentV1
  const v2 = (item as unknown) as PaymentV2
  let payments: { payee: string; amount: Balance<NetworkTokens> }[] = []
  if (v2.payments !== undefined) {
    payments = v2.payments.map((p) => ({
      payee: p.payee,
      amount: p.amount,
    }))
  } else if (v1.payee !== undefined) {
    payments = [{ payee: v1.payee, amount: v1.amount || 0 }]
  }

  const payer = isPayer(address, item)
  return (
    <Box flex={1} marginTop={payer ? 'none' : 'm'}>
      {payer && (
        <Text
          variant="light"
          fontSize={15}
          color="blueBright"
          alignSelf="flex-end"
          marginBottom="m"
        >
          {`-${v2.fee.toString()}`}
        </Text>
      )}

      <PaymentItem
        address={v1.payer}
        isPayer
        isMyAccount={v1.payer === address}
      />
      {payments.map((p, index) => (
        <PaymentItem
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          address={p.payee}
          isMyAccount={p.payee === address}
          isPayer={false}
          isFirst={false}
          isLast={index === payments.length - 1}
        />
      ))}
    </Box>
  )
}

export default Payment
