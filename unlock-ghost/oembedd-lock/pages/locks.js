import Head from 'next/head'

import {Container, Navbar} from "../components/Container";
import {Title} from "../components/Text";
import SvgUnlock, {LogoContainer} from "../components/SvgUnlock";
import {useRouter} from "next/router";
import {buildLocks} from "../utils";

const styles = {
  noShow: {
    display: 'none'
  },
  maxWidth: {
    maxWidth: '500px'
  },
  code: {
    paddingLeft: '30px'
  }
};


const LockEntry = (props) => {
  return (<tr>
    <td>{props.address}</td>
    <td>{props.name}</td>
  </tr>)
}

export default function Locks(props) {
  const {locks} = props;
  const oembedURL = locks.reduce((lockStr, lock) => `${lockStr}&locks=${lock.address},${lock.encoded}`, '');

  return (<div>
    <Head>
      <title>Home locked</title>
      <link rel="alternate" type="application/json+oembed"
            href={`${process.env.serverURL}/api/oembed?${oembedURL}`}
            title="Lock Home" />
    </Head>
    <Navbar>
      <LogoContainer>
        <SvgUnlock title='Locks Embed Generator'/>
      </LogoContainer>
      <Title style={{marginLeft: '15px'}}>Locks Embed Generator</Title>
    </Navbar>
    <Container>
      <a href={`${process.env.serverURL}/api/oembed?${oembedURL}`}>OEmbed URL</a>
      <p>This page host the following locks:</p>
      <table>
        <tr>
          <th>Lock</th> <th>Name</th>
        </tr>
        {locks.map(lock => <LockEntry {...lock} />)}

    </table>
    </Container>
  </div>);

}

export async function getServerSideProps(context) {
  const {query} = context;
  const locks = buildLocks( typeof query.locks === 'string' ? [query.locks] : (query.locks || []));

  return { props: { locks } }

}