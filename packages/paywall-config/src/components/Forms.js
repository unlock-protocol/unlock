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
import networks from '@unlock-protocol/networks'
import { initialValues, labels, genJson, genUrl, validateField, calltoAction } from "./config";

const Forms = (props) => {
  const [show, setShow] = useState();//state for modal window
  const [json, setJson] = useState(); //state for update the json 
  const [uri, setUri] = useState(); // state for update the uri 
  const [input, setInput] = useState(false); // state to show or not the metadata form 

  //handle modal window
  function handleClose() {
    setShow(false);
  }
// copy the generated uri in the modal window
  const copyUri = async () => {
    await navigator?.clipboard?.writeText(uri);
    alert("URL Copied to your clipboard");
  };
// copy the generated json in the modal window
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
            <Form>{/* Array for lock or multiple locks*/}
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
                              className="form-check form-check-inline"
                              key={networks[i]}
                            >
                              <Field
                                className="form-check-input"
                                type="radio"
                                name={`locks.${index}.network`}
                                data-testid={`locksNetworks${index}`}
                                id="gridRadios"
                                value={i}
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
                              data-testid={`locksAddress${index}`}
                              validate={validateField}
                              placeholder="0x6dDcB553E1A7f06bb46fA9Bd65BEd73056649eb6"
                              className="form-control"
                              type="text"
                            />
                            <ErrorMessage
                              component="div"
                              className="field-error text-red"
                              data-testid={`locksAddressError${index}`}
                              name={`locks.${index}.address`}
                            />
                          </div>
                          <div className="form-group">
                            <label htmlFor={`locks.${index}.name`}>Name</label>
                            <Field
                              name={`locks.${index}.name`}
                              data-testid={`locksName${index}`}
                              className="form-control"
                              type="text"
                              placeholder="Name for your lock"
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
                      data-testid={'AddLocks'}
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
                <div className="form-group " key={i}>
                  <label htmlFor="">{labels[i]}</label>
                  <Field
                    name={i}
                    className="form-control"
                    type={i === "network" ? "number" : "text"}
                  />
                </div>
              ))}
              <div className="form-group border p-2 mt-2">
                <label htmlFor="">Set a Message to your buyers(optional):</label>
                {Object.keys(calltoAction).map((i) => (
                  <div className="form-group " key={i}>
                    <label htmlFor="" className="text-capitalize">{`${i}:`}</label>
                    <Field
                      name={`calltoAction.${i}`}
                      className="form-control"
                      type="text"
                      placeholder={ i === "default" ? "Please Join this membership" : ""}
                    />
                  </div>
                ))}
              </div>

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
                  <div className="form-check form-check-inline" key={val}>
                    <Field
                      className="form-check-input"
                      type="radio"
                      name="pessimistic"
                      id="gridRadios"
                      value={val}
                      
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
              <Row className="form-group mt-3 border ">
                <label htmlFor="" className="mb-1">
                  <h6>Meta Inputs(optional)</h6>
                </label>
                {!input ?  
                  <Button variant={'secondary'} onClick={()=> {setInput(true)}}>
                    Add metadata
                  </Button>
                 :
                 <FieldArray name="metadataInputs">
                   {/* Array for metadata form or multiple metadata*/}
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
                                   className="form-check form-check-inline"
                                   key={i}
                                 >
                                   <Field
                                     className="form-check-input"
                                     type="radio"
                                     validate={validateField}
                                     name={`metadataInputs.${index}.type`}
                                     data-testid={`metadataTypes${index}`}
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
                               className="form-control"
                               validate={validateField}
                               type="text"
                               name={`metadataInputs.${index}.name`}
                               data-testid={`metadataName${index}`}
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
                                 className="form-check form-check-inline"
                                 key={i}
                               >
                                 <Field
                                   className="form-check-input"
                                   validate={validateField}
                                   type="radio"
                                   name={`metadataInputs.${index}.required`}
                                   data-testid={`metadataReq${index}`}
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
                               className="form-control"
                               type="text"
                               name={`metadataInputs.${index}.defaultValue`}
                               placeholder="Default value(optional)"
                             />
                           </div>
                           <div className="form-group">
                             <label htmlFor="">Public?</label>
                             <br />
                             {["true", "false"].map((i) => (
                               <div
                                 className="form-check form-check-inline"
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
                       data-testid={'AddMeta'}
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
                  data-testid={'submit'}
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

export default Forms;

