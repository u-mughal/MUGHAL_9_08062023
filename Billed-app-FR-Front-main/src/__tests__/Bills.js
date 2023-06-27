/**
 * @jest-environment jsdom
 */

import {prettyDOM, screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"

import mockStore from "../__mocks__/store"

import { ROUTES_PATH, ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"

import { bills } from "../fixtures/bills"
import router from "../app/Router"
import Bills from "../containers/Bills.js"

jest.mock("../app/store", () => mockStore) // ?

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon).toBeTruthy();
    })

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe('When I click on the eye icon', () => { 
  test("It should render a modal", async () => {
    $.fn.modal = jest.fn() // JQuery Error
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))

    const onNavigate = (pathname) => {
      document.body.innerHTML = ROUTES({ pathname})
    }

    document.body.innerHTML = BillsUI({ data: bills.sort((a, b) => new Date(b.date) - new Date(a.date)) })

    new Bills({
      document, onNavigate, localStorage: window.localStorage
    });

    const eyeIcon = screen.getAllByTestId("icon-eye")[0];
    fireEvent.click(eyeIcon);

    expect(screen.getByText("Justificatif")).toBeTruthy();
    expect(screen.getByAltText("Bill")).toBeTruthy();
  })
})


// test d'intégration GET
describe("Given I am connected as an employee", () => {
  test("fetches bills from mock API GET", async () => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = "<div id='root'></div>";
    router()
    window.onNavigate(ROUTES_PATH.Bills)

    await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy());
    const tbody = screen.getByTestId("tbody");
    expect(tbody).toBeTruthy();
    expect(tbody.childElementCount).toBe(4);
  })

  describe("When an error occurs on API" ,() => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills')
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      );
      window.localStorage.setItem('user', JSON.stringify({ type: 'Employee', email: 'api@test.fr'}));
      document.body.innerHTML = `<div id="root"></div>`;
      router();
    })

    test('fetches bills from an API and fails with 404 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"));
          }
        }})
        window.onNavigate(ROUTES_PATH.Bills)
        await waitFor(() => expect(screen.getByText("Erreur 404")).toBeTruthy());
    })

    test('fetches bills from an API and fails with 500 message error', async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => expect(screen.getByText("Erreur 500")).toBeTruthy());
    })
  })
});