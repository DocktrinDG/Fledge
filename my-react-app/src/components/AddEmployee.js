import React from 'react';
import { CDBInput, CDBCard, CDBCardBody, CDBBtn, CDBContainer } from 'cdbreact';

const AddEmployeeForm = () => {
  return (
    <CDBContainer>
      <CDBCard style={{ width: '50rem', height: '40rem' }}>
        <div style={{ background: 'grey' }} className="text-center text-white">
          <p className="h5 mt-2 py-4 font-weight-bold">Contact Us</p>
        </div>
        <CDBCardBody className="mx-4">
          <CDBInput label="Name" type="text" />
          <CDBInput label="E-mail" type="email" />
          <CDBInput label="Message" type="textarea" />
          <div className="d-flex justify-content-center align-items-center mt-4">
            <CDBInput type="Checkbox" />
            <p className="m-0">Send me a copy of this message</p>
          </div>
          <CDBBtn color="dark" outline className="btn-block my-3 mx-0">
            Send
          </CDBBtn>
        </CDBCardBody>
      </CDBCard>
    </CDBContainer>
  );
};
export default AddEmployeeForm;