process.env.NODE_ENV = 'test';

const Donor = require('../models/Donor');
const Request = require('../models/Request');
const { createRequestAndMatch } = require('../controllers/requestController');

// Minimal Express res mock
function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json   = jest.fn();
  return res;
}

afterEach(() => {
  jest.restoreAllMocks();
});

test('createRequestAndMatch: creates request and returns matching donors', async () => {
  // 1) pretend the client posted this requirement
  const body = {
    patientName: 'Raj',
    bloodTypeNeeded: 'O+',
    hospitalName: 'City Hospital',
    status: 'URGENT'
  };

  // 2) stub Request.create to "create" the requirement
  const createdReq = { _id: 'req1', ...body, createdAt: new Date().toISOString() };
  jest.spyOn(Request, 'create').mockResolvedValue(createdReq);

  // 3) stub donor query chain: Donor.find(...).select(...).sort(...)
  const fakeMatches = [
    { _id: 'd1', name: 'Asha', email: 'asha@example.com', contactNumber: '9876543210', lastDonationDate: '2024-06-01', bloodType: 'O+' },
    { _id: 'd2', name: 'Ravi', email: 'ravi@example.com', contactNumber: '9999999999', lastDonationDate: '2024-04-10', bloodType: 'O+' }
  ];
  const sort   = jest.fn().mockResolvedValue(fakeMatches);
  const select = jest.fn().mockReturnValue({ sort });
  jest.spyOn(Donor, 'find').mockReturnValue({ select });

  // 4) call the controller with mocked req/res
  const req = { body };
  const res = mockRes();
  await createRequestAndMatch(req, res);

  // 5) assertions
  expect(Request.create).toHaveBeenCalledWith(body);
  expect(Donor.find).toHaveBeenCalledWith({ bloodType: 'O+' });
  expect(select).toHaveBeenCalledWith('name contactNumber email lastDonationDate bloodType');
  expect(sort).toHaveBeenCalledWith({ lastDonationDate: -1 });

  expect(res.status).toHaveBeenCalledWith(201);
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      request: createdReq,
      matches: fakeMatches
    })
  );
});