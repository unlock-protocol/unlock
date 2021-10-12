import React, { useState } from "react";
import {
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Modal,
  Button,
} from "react-bootstrap";
import { Formik, Field, Form, ErrorMessage, FieldArray } from "formik";
import { initialValues, networks, labels, genJson, genUrl, validateField } from "./config";
//https://raw.githubusercontent.com/unlock-protocol/unlock/d29e411dd8d65ef638b8b9dc8172d36e761fb3d6/design/brand/Unlock-WorkMark.svg
const Forms = (props) => {
  const [show, setShow] = useState();
  const [json, setJson] = useState();
  const [uri, setUri] = useState();
  const [input, setInput] = useState(false);

  function handleClose() {
    setShow(false);
  }

  const copyUri = async () => {
    await navigator?.clipboard?.writeText(uri);
    alert("URL Copied to your clipboard");
  };

  const copyConfig = async () => {
    const pre = document.getElementById("jsonInfo").innerText;
    await navigator?.clipboard?.writeText(pre);
    alert("Config object copied to your clipboard!");
  };
 

  return (
    <Row>
      <Col md={8} className="border rounded p-3">
        <div className="text-center text-black text-center bold">
          <img 
              src="https://raw.githubusercontent.com/unlock-protocol/unlock/d29e411dd8d65ef638b8b9dc8172d36e761fb3d6/design/brand/Unlock-WorkMark.svg" 
              alt="unlock" 
              width='60%'
              height='10%'
              className=" mb-2"    
              />Paywall Configuration
       </div>
        <Formik
          initialValues={initialValues}
          onSubmit={(values, { setSubmitting }) => {
            setTimeout(async () => {
              const data = await genJson(values);
              setJson(data);
              const uris = await genUrl(values);
              setUri(uris);
              setShow(true);
              setSubmitting(false);
            }, 2500);
          }}
        >
          {({ isSubmitting, values }) => (
            <Form>
              <FieldArray name="locks">
                {({ insert, remove, push }) => (
                  <div>
                    {values.locks.length >= 0 &&
                      values.locks.map((lock, index) => (
                        <div className="form-group py-3" key={index}>
                          <label htmlFor="network">Network</label>
                          <br />
                          {Object.keys(networks).map((i) => (
                            <div
                              class="form-check form-check-inline"
                              key={networks[i]}
                            >
                              <Field
                                className="form-check-input"
                                type="radio"
                                name={`locks.${index}.network`}
                                id="gridRadios"
                                value={i.toString()}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="gridRadios1"
                              >
                                {networks[i]}
                              </label>
                            </div>
                          ))}
                          <div className="form-group">
                            <label htmlFor={`locks.${index}.address`}>
                              Lock Address
                            </label>
                            <Field
                              name={`locks.${index}.address`}
                              validate={validateField}
                              placeholder="0x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6"
                              className="form-control"
                              type="text"
                            />
                            <ErrorMessage
                              name={`locks.${index}.address`}
                              component="div"
                              className="field-error text-red"
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`locks.${index}.name`}>Name</label>
                            <Field
                              name={`locks.${index}.name`}
                              className="form-control"
                              type="text"
                              placeholder="Name for your lock"
                            />
                            <ErrorMessage
                              name={`locks.${index}.name`}
                              component="div"
                              className="field-error"
                            />
                          </div>
                          {values.locks.length > 1 && (
                            <div className="form-group mt-3">
                              <Button
                                type="button"
                                variant={"secondary"}
                                onClick={() => remove(index)}
                              >
                                Remove this lock
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    <Button
                      type="button"
                      variant={"secondary"}
                      className="mb-3"
                      onClick={() =>
                        push({ name: "", address: "", network: "1" })
                      }
                    >
                      Add more locks
                    </Button>
                  </div>
                )}
              </FieldArray>

              {Object.keys(labels).map((i) => (
                <div clasName="form-group " key={i}>
                  <label htmlFor="">{labels[i]}</label>
                  <Field
                    name={i}
                    className="form-control"
                    type={i === "network" ? "number" : "text"}
                  />
                </div>
              ))}

              <div className="form-group">
                <label htmlFor="pessimistic">
                  Pessimistic -
                  <OverlayTrigger
                    className="p-3"
                    placement="right"
                    overlay={
                      <Tooltip id="tooltip-right">
                        By setting this to true, users will need to wait for the
                        transaction to have been mined in order to proceed to
                        the next step.
                      </Tooltip>
                    }
                  >
                    <strong>?</strong>
                  </OverlayTrigger>
                </label>
                <br />

                {["false", "true"].map((val) => (
                  <div class="form-check form-check-inline">
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="pessimistic"
                      id="gridRadios"
                      value={val}
                      key={val}
                    />
                    <label
                      className="form-check-label text-capitalize"
                      htmlFor="gridRadios1"
                    >
                      {val}
                    </label>
                  </div>
                ))}
              </div>
              <Row className="form-group mt-3">
                <label htmlFor="" className="mb-1">
                  <h6>Meta Inputs(optional)</h6>
                </label>
                {!input ?  
                  <Button variant={'secondary'} onClick={()=> {setInput(true)}}>
                    Add metadata
                  </Button>
                 :
                 <FieldArray name="metadataInputs">
                 {({ insert, remove, push }) => (
                   <div>
                     {values.metadataInputs.length >= 0 &&
                       values.metadataInputs.map((meta, index) => (
                         <div className="form-group py-3" key={index}>
                           <div className="form-group">
                             <label htmlFor="">Type of metadata:</label>
                             <br />
                             {["text", "date", "color", "email", "url"].map(
                               (i) => (
                                 <div
                                   class="form-check form-check-inline"
                                   key={i}
                                 >
                                   <Field
                                     className="form-check-input"
                                     type="radio"
                                     validate={validateField}
                                     name={`metadataInputs.${index}.type`}
                                     id="gridRadios"
                                     value={i}
                                   />
                                    <ErrorMessage
                                      name={`metadataInputs.${index}.type`}
                                      component="div"
                                      className="field-error"
                                    />
                                   <label
                                     className="form-check-label text-capitalize"
                                     htmlFor="gridRadios1"
                                   >
                                     {i}
                                   </label>
                                 </div>
                               )
                             )}
                           </div>
                           <div className="form-group">
                             <Field
                               Field
                               className="form-control"
                               validate={validateField}
                               type="text"
                               name={`metadataInputs.${index}.name`}
                               id="meta"
                               placeholder="Name for the data(required)"
                             />
                             <ErrorMessage
                              name={`metadataInputs.${index}.name`}
                              component="div"
                              className="field-error text-red"
                            />
                           </div>
                           <div className="form-group">
                             <label>Required?</label>
                             <br />
                             {["true", "false"].map((i) => (
                               <div
                                 class="form-check form-check-inline"
                                 key={i}
                               >
                                 <Field
                                   className="form-check-input"
                                   validate={validateField}
                                   type="radio"
                                   name={`metadataInputs.${index}.required`}
                                   id="gridRadios"
                                   value={i}
                                 />
                                 <ErrorMessage
                                    name={`metadataInputs.${index}.required`}
                                    component="div"
                                    className="field-error"
                                  />
                          
                                 <label
                                   className="form-check-label"
                                   htmlFor="gridRadios1"
                                 >
                                   {i === "true" ? "Yes" : "No"}
                                 </label>
                               </div>
                             ))}
                           </div>
                           <div className="form-group">
                             <Field
                               Field
                               className="form-control"
                               type="text"
                               name={`metadataInputs.${index}.defaultValue`}
                               id="metaInputs"
                               placeholder="Default value(optional)"
                             />
                           </div>
                           <div className="form-group">
                             <label htmlFor="">Public?</label>
                             <br />
                             {["true", "false"].map((i) => (
                               <div
                                 class="form-check form-check-inline"
                                 key={i}
                               >
                                 <Field
                                   className="form-check-input"
                                   type="radio"
                                   name={`metadataInputs.${index}.public`}
                                   id="gridRadios"
                                   value={i}
                                 />
                                 <label
                                   className="form-check-label"
                                   htmlFor="gridRadios1"
                                 >
                                   {i === "true" ? "Yes" : "No"}
                                 </label>
                               </div>
                             ))}
                           </div>
                           {values.metadataInputs.length >= 1 && (
                             <div className="form-group mt-3">
                               <Button
                                 type="button"
                                 variant={"secondary"}
                                 onClick={() => remove(index)}
                               >
                                 Remove this metadata
                               </Button>
                             </div>
                           )}
                         </div>
                       ))}
                     <Button
                       type="button"
                       variant={"secondary"}
                       className="mb-3"
                       onClick={() =>
                         push({
                          
                         })
                       }
                     >
                       Add more metadata
                     </Button>
                   </div>
                 )}
               </FieldArray>
                }
               
              </Row>

              <div className="form-group text-center">
                <button
                  type="submit"
                  className="btn btn-danger mt-4"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Generating json" : "Submit"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Paywall config</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row id="jsonShow" className="">
              <h6>Config Json script:</h6>
              <pre id="jsonInfo">
                {`<script>var unlockProtocolConfig = ${json}</script>`}
              </pre>
              <Button variant="secondary" onClick={copyConfig}>
                Copy configuration
              </Button>
            </Row>

            <Row id="urlShow" className="py-3">
              <h6>Paywall URL:</h6>
              <input
                type="text"
                name="uris"
                className="mb-2"
                value={uri}
                readOnly
              />
              <Button variant="secondary" onClick={copyUri}>
                Copy Url
              </Button>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="danger" onClick={handleClose}>
              Close window
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
};

//https://app.unlock-protocol.com/checkout?redirectUri=https%3A%2F%2Fwww.google.com&paywallConfig=%7B%22locks%22%3A%7B%220x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6%22%3A%7B%22network%22%3A4%7D%7D%2C%22pessimistic%22%3Atrue%2C%22persistentCheckout%22%3Atrue%2C%22icon%22%3A%22https%3A%2F%2Flocksmith.unlock-protocol.com%2Flock%2F0x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6%2Ficon%22%7D
//https://app.unlock-protocol.com/checkout?redirectUri=https%3A%2F%2Fwww.google.com&paywallConfig=%7B%0A%20%20%22pessimistic%22%3A%20%22false%22%2C%0A%20%20%22locks%22%3A%20%7B%0A%20%20%20%20%220x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6%22%3A%20%7B%0A%20%20%20%20%20%20%22network%22%3A%20%221%22%2C%0A%20%20%20%20%20%20%22name%22%3A%20%22manyrios56%22%0A%20%20%20%20%7D%0A%20%20%7D%2C%0A%20%20%22icon%22%3A%20%22https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2Fthumb%2F4%2F4c%2FTypescript_logo_2020.svg%2F300px-Typescript_logo_2020.svg.png%22%2C%0A%20%20%22callToAction%22%3A%20%7B%0A%20%20%20%20%22default%22%3A%20%22Please%20go%20here%20to%20pick%20up%20my%20dog%20tag%22%0A%20%20%7D%2C%0A%20%20%22metadataInputs%22%3A%20%5B%0A%20%20%20%20%7B%0A%20%20%20%20%20%20%22name%22%3A%20%22Your%20Birthday%22%2C%0A%20%20%20%20%20%20%22type%22%3A%20%22date%22%2C%0A%20%20%20%20%20%20%22required%22%3A%20%22true%22%2C%0A%20%20%20%20%20%20%22defaultValue%22%3A%20%2205%2F27%2F1989%22%2C%0A%20%20%20%20%20%20%22public%22%3A%20%22false%22%0A%20%20%20%20%7D%0A%20%20%5D%0A%7D
export default Forms;

