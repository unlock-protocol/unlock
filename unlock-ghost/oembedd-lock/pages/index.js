import {useState} from "react";
import Snippet from "../components/snippet";
import { Base64 } from 'js-base64';
import Button from "../components/Button";
import {Box} from "../components/Box";
import {Input, Label} from "../components/Input";
import {CardContainer, Container, FieldGroup, Navbar} from "../components/Container";
import {Title} from "../components/Text";
import SvgUnlock, {LogoContainer} from "../components/SvgUnlock";

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

export default function index() {
  const [lock, setLock]  = useState('');
  const [name, setName] = useState('');
  const [showSnippet, setShowSnippet] = useState(false);

  const handleGenerate = () => {
      if (lock.match(/^0x[\w\d]*$/) == null) {
        alert('Please provide a lock');
        return;
      }
      if (name.match(/[\d\w][\d\w\s]{0,30}/) == null) {
        alert('Please provide a name');
        return;
      }

      setShowSnippet(true);
  };

  return (<div>
    <Navbar>
      <LogoContainer>
        <SvgUnlock title='Locks Embed Generator'/>
      </LogoContainer>
      <Title style={{marginLeft: '15px'}}>Locks Embed Generator</Title>
    </Navbar>
    <Container>
    <Box>
     <CardContainer>
       <FieldGroup>
        <Input name='lock' id='lock' value={lock} onChange={(e)  => setLock(e.target.value)} />
       <Label>Lock</Label>
       </FieldGroup>
       <FieldGroup>
         <Input name='name' id='name' value={name} onChange={(e) => setName(e.target.value)} />
         <Label>Name</Label>
       </FieldGroup>
       <Button onClick={handleGenerate}>Generate</Button>
      </CardContainer>

    </Box>

      <p>This page host the following locks:</p>
      { showSnippet ?
        <div id='setup-code'>
          <h2>Insert the following url in the `Embedded > Other...` option at your ghost editor:</h2>
          <a id='url' href={`${ process.env.serverURL }/locks?locks=${lock},${Base64.encode(name)}`}>
            {`${process.env.serverURL}/locks?locks=${lock},${Base64.encode(name.value)}`}
          </a>
          <h2>Also you can use the insert code option</h2>
          <h3>1. In you post add a new HTML section:</h3>
          <img style={styles.maxWidth} src='https://github.com/zoek1/unlock/raw/feature/ghost-support/unlock-ghost/screenshots/new_html.png' />
          <h3>2. Insert this code</h3>
          <pre style={styles.code} id='code'>
            <Snippet lock={lock} name={name}/>
          </pre>
          <h3>3. Update your changes and now yout site is ready to support subscriptions!</h3>
          <img style={styles.maxWidth}  src='https://github.com/zoek1/unlock/raw/feature/ghost-support/unlock-ghost/screenshots/publish.png' />
        </div> : <></> }
    </Container>
  </div>);

}