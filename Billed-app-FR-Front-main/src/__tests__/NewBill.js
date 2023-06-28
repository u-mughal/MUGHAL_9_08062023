/**
 * @jest-environment jsdom
 */

import { fireEvent, prettyDOM, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Store from "../app/Store";

jest.mock('../app/store', () => mockStore)

describe('Given I am connected as an employee', () => {
    describe('When I am on NewBill Page ans i click on button change file', () => {
      beforeEach(() => {
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } })

        window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
        document.body.innerHTML = `<div id="root"></div>`
        router()
      })

      test('Then i can choose file with good extension', async () => {
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId("file");

        const file = new File(["contenu du fichier fake"], "facture.png", { type: "image/png" });

        inputFile.addEventListener("change", handleChangeFile);
        fireEvent.change(inputFile, { target: { files: [file] } });

        expect(handleChangeFile).toBeCalled();
        expect(inputFile.files.length).toBe(1);
        expect(inputFile.files[0].name).toBe("facture.png");
      })

      test('Then i can choose file with bad extension', async () => {
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const inputFile = screen.getByTestId("file");

        const file = new File(["contenu du fichier fake"], "facture.pdf", { type: "application/pdf" });

        inputFile.addEventListener("change", handleChangeFile);
        fireEvent.change(inputFile, { target: { files: [file] } });

        expect(handleChangeFile).toBeCalled();
        expect(inputFile.value).toBeFalsy();
      })

    })

    describe('When I do fill fields in correct format and I click on submit button', () => {
      test('Then I should post new Bill ticket', async () => {
        const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        }
        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });

        const inputData = {
            type: 'Transports',
            name:  'Billet de train Paris - Marseille',
            amount: '250',
            date:  '2023-04-25',
            vat: 80,
            pct: 25,
            file: new File(['billet de train'], 'billet.png', { type:'image/png' }),
            commentary: 'Note de deplacement professionnel',
            status: 'pending'
        }

        const inputType = screen.getByTestId('expense-type');
        const inputName = screen.getByTestId('expense-name');
        const inputDate = screen.getByTestId('datepicker');
        const inputAmmount = screen.getByTestId('amount');
        const inputVat = screen.getByTestId('vat');
        const inputPct = screen.getByTestId('pct');
        const inputComment= screen.getByTestId('commentary');
        const inputFile = screen.getByTestId('file');
        const form = screen.getByTestId('form-new-bill');

        fireEvent.change(inputType, { target: { value: inputData.type } });
        fireEvent.change(inputName, { target: { value: inputData.name } });
        fireEvent.change(inputDate, { target: { value: inputData.date } });
        fireEvent.change(inputAmmount, { target: { value: inputData.amount } });
        fireEvent.change(inputVat, { target: { value: inputData.vat } });
        fireEvent.change(inputPct, { target: { value: inputData.pct } });
        fireEvent.change(inputComment, { target: { value: inputData.commentary } });

        const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        inputFile.addEventListener("change", handleChangeFile);
        form.addEventListener('submit', handleSubmit);

        userEvent.upload(inputFile, inputData.file);
        fireEvent.submit(form);

        expect(handleSubmit).toHaveBeenCalled();

        expect(inputType.validity.valid).toBeTruthy();
        expect(inputName.validity.valid).toBeTruthy();
        expect(inputDate.validity.valid).toBeTruthy();
        expect(inputAmmount.validity.valid).toBeTruthy();
        expect(inputVat.validity.valid).toBeTruthy();
        expect(inputPct.validity.valid).toBeTruthy();
        expect(inputComment.validity.valid).toBeTruthy();
        expect(inputFile.files[0]).toBeDefined();
      })

      test('Then it should be render Bills Page', () => {
        expect(screen.getAllByText('Mes notes de frais')).toBeTruthy();
      })
    })

    describe('When I do fill fields in incorrect format and I click on submit button', () => {
        test('Then I should have an error HTML validator form', async () => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock });
          Object.defineProperty(window, 'location', { value: { hash: ROUTES_PATH['NewBill'] } });

          window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }));
          document.body.innerHTML = `<div id="root"></div>`;
          router();

          const onNavigate = (pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
          }
          const newBill = new NewBill({ document,  onNavigate, store: mockStore, localStorage: window.localStorage });

          const inputData = {
            type: 'test',
            name:  'Vol Paris - Berlin',
            amount: 'test',
            date:  'date incorrect',
            vat: 70,
            pct: 'test',
            file: new File(['img'], 'image.png', {type:'image/png'}),
            commentary: 'Note de deplacement professionnel',
            status: 'pending'
          }

          const inputType = screen.getByTestId('expense-type');
          const inputName = screen.getByTestId('expense-name');
          const inputDate = screen.getByTestId('datepicker');
          const inputAmmount = screen.getByTestId('amount');
          const inputVat = screen.getByTestId('vat');
          const inputPct = screen.getByTestId('pct');
          const inputComment= screen.getByTestId('commentary');
          const inputFile = screen.getByTestId('file');
          const form = screen.getByTestId('form-new-bill');

          fireEvent.change(inputType, { target: { value: inputData.type } });
          fireEvent.change(inputName, { target: { value: inputData.name } });
          fireEvent.change(inputDate, { target: { value: inputData.date } });
          fireEvent.change(inputAmmount, { target: { value: inputData.amount } });
          fireEvent.change(inputVat, { target: { value: inputData.vat } });
          fireEvent.change(inputPct, { target: { value: inputData.pct } });
          fireEvent.change(inputComment, { target: { value: inputData.commentary } });
          userEvent.upload(inputFile, inputData.file)

          const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
          form.addEventListener('submit', handleSubmit);
          fireEvent.submit(form);

          expect(handleSubmit).toHaveBeenCalled();

          expect(inputType.validity.valid).not.toBeTruthy();
          expect(inputDate.validity.valid).not.toBeTruthy();
          expect(inputAmmount.validity.valid).not.toBeTruthy();
          expect(inputPct.validity.valid).not.toBeTruthy();
        })
    })
})