import styled from 'styled-components'

export const Input = styled.input`
    width: 100%;
    text-align: left;
    height: 26px;
    font-family: "IBM Plex Mono", "sans serif";
    font-size: 14px;
    font-weight: 200;
    border-radius: 4px;
    padding: 0px 8px;
    background-color: rgb(238, 238, 238);
    border-radius:4px;
    border: 0.997596px solid rgb(246, 246, 246);
    
    &:focus {
      outline: none;
      transition: border 100ms ease 0s;
      border-color: rgb(166, 166, 166);
    }
`;


export const Label = styled.label`
    font-family: "IBM Plex Mono", "Courier New", serif;
    font-weight: 200;
    min-height: 48px;
    padding-left: 8px;
    color: #333333;
    display: grid;
    -webkit-box-align: start;
    align-items: start;
    grid-row-gap: 0px;
    font-size: 14px;
    
`;