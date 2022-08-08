import React from 'react'
import About from '../build/svg-component/About.tsx'
import Adfree from '../build/svg-component/Adfree.tsx'
import AppStore from '../build/svg-component/AppStore.tsx'
import Arrow from '../build/svg-component/Arrow.tsx'
import Attention from '../build/svg-component/Attention.tsx'
import Bars from '../build/svg-component/Bars.tsx'
import Blog from '../build/svg-component/Blog.tsx'
import Carret from '../build/svg-component/Carret.tsx'
import Cart from '../build/svg-component/Cart.tsx'
import Checkmark from '../build/svg-component/Checkmark.tsx'
import ChevronUp from '../build/svg-component/ChevronUp.tsx'
import Close from '../build/svg-component/Close.tsx'
import Cloudflare from '../build/svg-component/Cloudflare.tsx'
import Code from '../build/svg-component/Code.tsx'
import Cog from '../build/svg-component/Cog.tsx'
import CoinbaseWallet from '../build/svg-component/CoinbaseWallet.tsx'
import Copy from '../build/svg-component/Copy.tsx'
import CreditCard from '../build/svg-component/CreditCard.tsx'
import Decentraland from '../build/svg-component/Decentraland.tsx'
import Discord from '../build/svg-component/Discord.tsx'
import Discourse from '../build/svg-component/Discourse.tsx'
import Docs from '../build/svg-component/Docs.tsx'
import Documentation from '../build/svg-component/Documentation.tsx'
import Download from '../build/svg-component/Download.tsx'
import Edit from '../build/svg-component/Edit.tsx'
import Eth from '../build/svg-component/Eth.tsx'
import Etherscan from '../build/svg-component/Etherscan.tsx'
import EthSub from '../build/svg-component/EthSub.tsx'
import Export from '../build/svg-component/Export.tsx'
import Firebase from '../build/svg-component/Firebase.tsx'
import Github from '../build/svg-component/Github.tsx'
import Heart from '../build/svg-component/Heart.tsx'
import Home from '../build/svg-component/Home.tsx'
import Idea from '../build/svg-component/Idea.tsx'
import Info from '../build/svg-component/Info.tsx'
import Jobs from '../build/svg-component/Jobs.tsx'
import Key from '../build/svg-component/Key.tsx'
import Lemniscate from '../build/svg-component/Lemniscate.tsx'
import LiveDemo from '../build/svg-component/LiveDemo.tsx'
import Loading from '../build/svg-component/Loading.tsx'
import LoadingDots from '../build/svg-component/LoadingDots.tsx'
import Lock from '../build/svg-component/Lock.tsx'
import LockClosed from '../build/svg-component/LockClosed.tsx'
import Log from '../build/svg-component/Log.tsx'
import Members from '../build/svg-component/Members.tsx'
import Metamask from '../build/svg-component/Metamask.tsx'
import Newsletter from '../build/svg-component/Email.tsx'
import Opera from '../build/svg-component/Opera.tsx'
import Person from '../build/svg-component/Person.tsx'
import Preview from '../build/svg-component/Preview.tsx'
import Qr from '../build/svg-component/Qr.tsx'
import Shopify from '../build/svg-component/Shopify.tsx'
import Telegram from '../build/svg-component/Telegram.tsx'
import Ticket from '../build/svg-component/Ticket.tsx'
import Twitter from '../build/svg-component/Twitter.tsx'
import Unlock from '../build/svg-component/Unlock.tsx'
import UnlockWordMark from '../build/svg-component/UnlockWordMark.tsx'
import Upload from '../build/svg-component/Upload.tsx'
import Wallet from '../build/svg-component/Wallet.tsx'
import WalletConnect from '../build/svg-component/WalletConnect.tsx'
import Webflow from '../build/svg-component/Webflow.tsx'
import Withdraw from '../build/svg-component/Withdraw.tsx'
import Wordpress from '../build/svg-component/Wordpress.tsx'
import UnlockMonogram from '../build/svg-component/UnlockMonogram.tsx'
import RocketLaunch from '../build/svg-component/RocketLaunch.tsx'

function wrapViewBox(WrappedComponent, viewBox) {
  const Wrapped = (props) => <WrappedComponent viewBox={viewBox} {...props} />
  return Wrapped
}

export default {
  About,
  Adfree: wrapViewBox(Adfree, '-3 -7 36 36'),
  AppStore: wrapViewBox(AppStore, '0 0 24 24'),
  Arrow: wrapViewBox(Arrow, '0 0 24 24'),
  Attention: wrapViewBox(Attention, '0 0 96 96'),
  Bars: wrapViewBox(Bars, '0 0 56 42'),
  Blog,
  Carret: wrapViewBox(Carret, '-6 -8 24 24'),
  Cart: wrapViewBox(Cart, '-3 -3 24 24'),
  Checkmark: wrapViewBox(Checkmark, '0 0 24 24'),
  ChevronUp: wrapViewBox(ChevronUp, '0 0 58 32'),
  Close: wrapViewBox(Close, '0 0 24 24'),
  Cloudflare: wrapViewBox(Cloudflare, '-4 -4 32 32'),
  Code: wrapViewBox(Code, '0 0 24 24'),
  Cog,
  CoinbaseWallet,
  Copy: wrapViewBox(Copy, '0 0 24 24'),
  CreditCard: wrapViewBox(CreditCard, '-12 -16 48 48'),
  Decentraland: wrapViewBox(Decentraland, '0 0 512 512'),
  Discord: wrapViewBox(Discord, '-4 -4 32 32'),
  Discourse: wrapViewBox(Discourse, '-5 -3 32 32'),
  Docs: wrapViewBox(Docs, '-6 -5 24 24'),
  Documentation: wrapViewBox(Documentation, '-6 -6 76 76'),
  Download: wrapViewBox(Download, '0 0 24 24'),
  Edit: wrapViewBox(Edit, '0 0 24 24'),
  Eth: wrapViewBox(Eth, '0 0 24 24'),
  Etherscan: wrapViewBox(Etherscan, '0 0 24 24'),
  EthSub: wrapViewBox(EthSub, '0 0 24 24'),
  Export: wrapViewBox(Export, '0 0 24 24'),
  Firebase: wrapViewBox(Firebase, '-6 0 150 140'),
  Github: wrapViewBox(Github, '0 0 24 24'),
  Heart: wrapViewBox(Heart, '-6 -6 36 36'),
  Home,
  Idea,
  Info,
  Jobs: wrapViewBox(Jobs, '0 0 24 24'),
  Key,
  Lemniscate: wrapViewBox(Lemniscate, '0 0 24 24'),
  LiveDemo: wrapViewBox(LiveDemo, '0 0 64 64'),
  Loading: wrapViewBox(Loading, '0 0 32 32'),
  LoadingDots,
  Lock: wrapViewBox(Lock, '-15 -4 120 120'),
  LockClosed: wrapViewBox(LockClosed, '0 0 24 24'),
  Log: wrapViewBox(Log, '0 0 24 24'),
  Members: wrapViewBox(Members, '-4 -4 24 24'),
  Metamask,
  Newsletter: wrapViewBox(Newsletter, '0 0 24 24'),
  Opera,
  Person: wrapViewBox(Person, '-6.5 -5 32 32'),
  Preview: wrapViewBox(Preview, '0 0 24 24'),
  Qr: wrapViewBox(Qr, '0 0 60 60'),
  Shopify: wrapViewBox(Shopify, '-4 -4 40 40'),
  Telegram: wrapViewBox(Telegram, '0 0 24 24'),
  Ticket: wrapViewBox(Ticket, '-8 -6 40 40'),
  Twitter: wrapViewBox(Twitter, '0 0 24 24'),
  RocketLaunch,
  Unlock: wrapViewBox(Unlock, '0 0 56 56'),
  UnlockWordMark: wrapViewBox(UnlockWordMark, '0 0 1200 256'),
  Upload: wrapViewBox(Upload, '0 0 24 24'),
  UnlockMonogram,
  Wallet: wrapViewBox(Wallet, '-8 -8 32 32'),
  WalletConnect: wrapViewBox(WalletConnect, '0 -1 32 32'),
  Webflow: wrapViewBox(Webflow, '-4 -8 32 32'),
  Withdraw: wrapViewBox(Withdraw, '0 0 24 24'),
  Wordpress: wrapViewBox(Wordpress, '0 0 340 340'),
}
