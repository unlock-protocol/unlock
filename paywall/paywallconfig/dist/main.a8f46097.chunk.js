(this["webpackJsonpunlock-purchase"]=this["webpackJsonpunlock-purchase"]||[]).push([[0],{49:function(e,t,a){},59:function(e,t,a){"use strict";a.r(t);var c=a(0),n=a.n(c),r=a(11),s=a.n(r),o=(a(49),a(67)),i=a(65),l=a(12),d=a.n(l),m=a(19),u=a(29),j=a(64),b=a(70),p=a(68),h=a(66),f=a(69),x=a(8),O=a(42),v=a(43),k={locks:[{address:"",network:"1",name:""}],icon:"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.10UUFNA8oLdFdDpzt-Em_QHaHa%26pid%3DApi&f=1",pessimistic:"false",defaultValueCall:"Please join this membership!",metadataInputs:[{}]},g={1:"Mainnet",100:"xDai",137:"Polygon",4:"Rinkeby"},y={icon:"Icon URL(optional):",default:"Set a Message(optional):",referrer:"Referrer(optional):"};function N(e){return w.apply(this,arguments)}function w(){return(w=Object(m.a)(d.a.mark((function e(t){var a,c,n;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return a={},t.locks.map((function(e,t){var c=e.address,n=e.network,r=e.name;return Object.defineProperty(a,"".concat(c),{value:{network:n,name:r},enumerable:!0})})),c={pessimistic:t.pessimistic,locks:Object(v.a)({},a),icon:t.icon,callToAction:{default:t.defaultValueCall},referrer:t.referrer},t.metadataInputs.length>0&&void 0!==t.metadataInputs[0].name&&(console.log(t.metadataInputs.length," ",t.metadataInputs.name),Object.defineProperty(c,"metadataInputs",{value:Object(O.a)(t.metadataInputs),enumerable:!0})),e.next=6,JSON.stringify(c,null,2);case 6:return n=e.sent,e.abrupt("return",n);case 8:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var I=function(e){var t;return e||(t="Required"),t};function F(e){return C.apply(this,arguments)}function C(){return(C=Object(m.a)(d.a.mark((function e(t){var a,c,n;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,N(t);case 2:return a=e.sent,e.next=5,encodeURIComponent(a);case 5:return c=e.sent,n="https://app.unlock-protocol.com/checkout?paywallConfig=".concat(c),e.abrupt("return",n);case 8:case"end":return e.stop()}}),e)})))).apply(this,arguments)}var R=a(1),S=function(e){var t=Object(c.useState)(),a=Object(u.a)(t,2),n=a[0],r=a[1],s=Object(c.useState)(),o=Object(u.a)(s,2),l=o[0],O=o[1],v=Object(c.useState)(),w=Object(u.a)(v,2),C=w[0],S=w[1],P=Object(c.useState)(!1),A=Object(u.a)(P,2),B=A[0],U=A[1];function T(){r(!1)}var D=function(){var e=Object(m.a)(d.a.mark((function e(){var t,a;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,null===(t=navigator)||void 0===t||null===(a=t.clipboard)||void 0===a?void 0:a.writeText(C);case 2:alert("URL Copied to your clipboard");case 3:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}(),q=function(){var e=Object(m.a)(d.a.mark((function e(){var t,a,c;return d.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return c=document.getElementById("jsonInfo").innerText,e.next=3,null===(t=navigator)||void 0===t||null===(a=t.clipboard)||void 0===a?void 0:a.writeText(c);case 3:alert("Config object copied to your clipboard!");case 4:case"end":return e.stop()}}),e)})));return function(){return e.apply(this,arguments)}}();return Object(R.jsx)(j.a,{children:Object(R.jsxs)(i.a,{md:8,className:"border rounded p-3",children:[Object(R.jsxs)("div",{className:"text-center text-black text-center bold",children:[Object(R.jsx)("img",{src:"https://raw.githubusercontent.com/unlock-protocol/unlock/d29e411dd8d65ef638b8b9dc8172d36e761fb3d6/design/brand/Unlock-WorkMark.svg",alt:"unlock",width:"60%",height:"10%",className:" mb-2"}),"Paywall Configuration"]}),Object(R.jsx)(x.e,{initialValues:k,onSubmit:function(e,t){var a=t.setSubmitting;setTimeout(Object(m.a)(d.a.mark((function t(){var c,n;return d.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,N(e);case 2:return c=t.sent,O(c),t.next=6,F(e);case 6:n=t.sent,S(n),r(!0),a(!1);case 10:case"end":return t.stop()}}),t)}))),2500)},children:function(e){var t=e.isSubmitting,a=e.values;return Object(R.jsxs)(x.d,{children:[Object(R.jsx)(x.c,{name:"locks",children:function(e){e.insert;var t=e.remove,c=e.push;return Object(R.jsxs)("div",{children:[a.locks.length>=0&&a.locks.map((function(e,c){return Object(R.jsxs)("div",{className:"form-group py-3",children:[Object(R.jsx)("label",{htmlFor:"network",children:"Network"}),Object(R.jsx)("br",{}),Object.keys(g).map((function(e){return Object(R.jsxs)("div",{class:"form-check form-check-inline",children:[Object(R.jsx)(x.b,{className:"form-check-input",type:"radio",name:"locks.".concat(c,".network"),id:"gridRadios",value:e.toString()}),Object(R.jsx)("label",{className:"form-check-label",htmlFor:"gridRadios1",children:g[e]})]},g[e])})),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)("label",{htmlFor:"locks.".concat(c,".address"),children:"Lock Address"}),Object(R.jsx)(x.b,{name:"locks.".concat(c,".address"),validate:I,placeholder:"0x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6",className:"form-control",type:"text"}),Object(R.jsx)(x.a,{name:"locks.".concat(c,".address"),component:"div",className:"field-error text-red"})]}),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)("label",{htmlFor:"locks.".concat(c,".name"),children:"Name"}),Object(R.jsx)(x.b,{name:"locks.".concat(c,".name"),className:"form-control",type:"text",placeholder:"Name for your lock"}),Object(R.jsx)(x.a,{name:"locks.".concat(c,".name"),component:"div",className:"field-error"})]}),a.locks.length>1&&Object(R.jsx)("div",{className:"form-group mt-3",children:Object(R.jsx)(b.a,{type:"button",variant:"secondary",onClick:function(){return t(c)},children:"Remove this lock"})})]},c)})),Object(R.jsx)(b.a,{type:"button",variant:"secondary",className:"mb-3",onClick:function(){return c({name:"",address:"",network:"1"})},children:"Add more locks"})]})}}),Object.keys(y).map((function(e){return Object(R.jsxs)("div",{clasName:"form-group ",children:[Object(R.jsx)("label",{htmlFor:"",children:y[e]}),Object(R.jsx)(x.b,{name:e,className:"form-control",type:"network"===e?"number":"text"})]},e)})),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsxs)("label",{htmlFor:"pessimistic",children:["Pessimistic -",Object(R.jsx)(p.a,{className:"p-3",placement:"right",overlay:Object(R.jsx)(h.a,{id:"tooltip-right",children:"By setting this to true, users will need to wait for the transaction to have been mined in order to proceed to the next step."}),children:Object(R.jsx)("strong",{children:"?"})})]}),Object(R.jsx)("br",{}),["false","true"].map((function(e){return Object(R.jsxs)("div",{class:"form-check form-check-inline",children:[Object(R.jsx)(x.b,{className:"form-check-input",type:"radio",name:"pessimistic",id:"gridRadios",value:e},e),Object(R.jsx)("label",{className:"form-check-label text-capitalize",htmlFor:"gridRadios1",children:e})]})}))]}),Object(R.jsxs)(j.a,{className:"form-group mt-3",children:[Object(R.jsx)("label",{htmlFor:"",className:"mb-1",children:Object(R.jsx)("h6",{children:"Meta Inputs(optional)"})}),B?Object(R.jsx)(x.c,{name:"metadataInputs",children:function(e){e.insert;var t=e.remove,c=e.push;return Object(R.jsxs)("div",{children:[a.metadataInputs.length>=0&&a.metadataInputs.map((function(e,c){return Object(R.jsxs)("div",{className:"form-group py-3",children:[Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)("label",{htmlFor:"",children:"Type of metadata:"}),Object(R.jsx)("br",{}),["text","date","color","email","url"].map((function(e){return Object(R.jsxs)("div",{class:"form-check form-check-inline",children:[Object(R.jsx)(x.b,{className:"form-check-input",type:"radio",validate:I,name:"metadataInputs.".concat(c,".type"),id:"gridRadios",value:e}),Object(R.jsx)(x.a,{name:"metadataInputs.".concat(c,".type"),component:"div",className:"field-error"}),Object(R.jsx)("label",{className:"form-check-label text-capitalize",htmlFor:"gridRadios1",children:e})]},e)}))]}),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)(x.b,{Field:!0,className:"form-control",validate:I,type:"text",name:"metadataInputs.".concat(c,".name"),id:"meta",placeholder:"Name for the data(required)"}),Object(R.jsx)(x.a,{name:"metadataInputs.".concat(c,".name"),component:"div",className:"field-error text-red"})]}),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)("label",{children:"Required?"}),Object(R.jsx)("br",{}),["true","false"].map((function(e){return Object(R.jsxs)("div",{class:"form-check form-check-inline",children:[Object(R.jsx)(x.b,{className:"form-check-input",validate:I,type:"radio",name:"metadataInputs.".concat(c,".required"),id:"gridRadios",value:e}),Object(R.jsx)(x.a,{name:"metadataInputs.".concat(c,".required"),component:"div",className:"field-error"}),Object(R.jsx)("label",{className:"form-check-label",htmlFor:"gridRadios1",children:"true"===e?"Yes":"No"})]},e)}))]}),Object(R.jsx)("div",{className:"form-group",children:Object(R.jsx)(x.b,{Field:!0,className:"form-control",type:"text",name:"metadataInputs.".concat(c,".defaultValue"),id:"metaInputs",placeholder:"Default value(optional)"})}),Object(R.jsxs)("div",{className:"form-group",children:[Object(R.jsx)("label",{htmlFor:"",children:"Public?"}),Object(R.jsx)("br",{}),["true","false"].map((function(e){return Object(R.jsxs)("div",{class:"form-check form-check-inline",children:[Object(R.jsx)(x.b,{className:"form-check-input",type:"radio",name:"metadataInputs.".concat(c,".public"),id:"gridRadios",value:e}),Object(R.jsx)("label",{className:"form-check-label",htmlFor:"gridRadios1",children:"true"===e?"Yes":"No"})]},e)}))]}),a.metadataInputs.length>=1&&Object(R.jsx)("div",{className:"form-group mt-3",children:Object(R.jsx)(b.a,{type:"button",variant:"secondary",onClick:function(){return t(c)},children:"Remove this metadata"})})]},c)})),Object(R.jsx)(b.a,{type:"button",variant:"secondary",className:"mb-3",onClick:function(){return c({})},children:"Add more metadata"})]})}}):Object(R.jsx)(b.a,{variant:"secondary",onClick:function(){U(!0)},children:"Add metadata"})]}),Object(R.jsx)("div",{className:"form-group text-center",children:Object(R.jsx)("button",{type:"submit",className:"btn btn-danger mt-4",disabled:t,children:t?"Generating json":"Submit"})})]})}}),Object(R.jsxs)(f.a,{show:n,onHide:T,children:[Object(R.jsx)(f.a.Header,{closeButton:!0,children:Object(R.jsx)(f.a.Title,{children:"Paywall config"})}),Object(R.jsxs)(f.a.Body,{children:[Object(R.jsxs)(j.a,{id:"jsonShow",className:"",children:[Object(R.jsx)("h6",{children:"Config Json script:"}),Object(R.jsx)("pre",{id:"jsonInfo",children:"<script>var unlockProtocolConfig = ".concat(l,"<\/script>")}),Object(R.jsx)(b.a,{variant:"secondary",onClick:q,children:"Copy configuration"})]}),Object(R.jsxs)(j.a,{id:"urlShow",className:"py-3",children:[Object(R.jsx)("h6",{children:"Paywall URL:"}),Object(R.jsx)("input",{type:"text",name:"uris",className:"mb-2",value:C,readOnly:!0}),Object(R.jsx)(b.a,{variant:"secondary",onClick:D,children:"Copy Url"})]})]}),Object(R.jsx)(f.a.Footer,{children:Object(R.jsx)(b.a,{variant:"danger",onClick:T,children:"Close window"})})]})]})})},P=function(){return Object(R.jsx)(o.a,{children:Object(R.jsx)(i.a,{md:6,children:Object(R.jsx)(S,{})})})};a(58);s.a.render(Object(R.jsx)(n.a.StrictMode,{children:Object(R.jsx)(P,{})}),document.getElementById("paywallConfig"))}},[[59,1,2]]]);
//# sourceMappingURL=main.a8f46097.chunk.js.map