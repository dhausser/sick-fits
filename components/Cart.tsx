import { useCart } from './LocalState'
import { useUser } from './User'
import CartStyles from './styles/CartStyles'
import Supreme from './styles/Supreme'
import CloseButton from './styles/CloseButton'
import CartItem from './CartItem'
import calcTotalPrice from '../lib/calcTotalPrice'
import formatMoney from '../lib/formatMoney'
import Checkout from './Checkout'

function Cart(): JSX.Element {
  let totalItems = 0
  const user = useUser()
  const { cartOpen, toggleCart } = useCart()

  totalItems = user?.cart.reduce((acc, current) => {
    return (acc = acc + current.quantity)
  }, 0) as number

  return (
    <CartStyles open={cartOpen} data-testid="cart">
      <header>
        <CloseButton onClick={toggleCart} title="close">
          &times;
        </CloseButton>
        <Supreme>{`${user?.name}'s Cart`}</Supreme>
        <p>
          You Have {totalItems} Item{totalItems === 1 ? '' : 's'} in your cart.
        </p>
      </header>
      <ul>
        {user?.cart.map((cartItem) => (
          <CartItem key={cartItem.id} cartItem={cartItem} />
        ))}
      </ul>
      {user?.cart.length && (
        <footer>
          <p>{formatMoney(calcTotalPrice(user?.cart))}</p>
          <Checkout />
        </footer>
      )}
    </CartStyles>
  )
}

export default Cart
export { Cart }
