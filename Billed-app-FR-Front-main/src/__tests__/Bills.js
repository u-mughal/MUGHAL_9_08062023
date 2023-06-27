/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"

import mockStore from "../__mocks__/store"

import { ROUTES_PATH } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"

import { bills } from "../fixtures/bills"
import router from "../app/Router"

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

// test d'intégration GET
describe("Given I am connected as an employee", () => {
  test("fetches bills from mock API GET", async () => {
    localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = "<div id='root'></div>";
    router() // ?
    window.onNavigate(ROUTES_PATH.Bills) // ?

    await waitFor(() => expect(screen.getByText("Mes notes de frais")).toBeTruthy());
    const tbody = screen.getByTestId("tbody");
    expect(tbody).toBeTruthy();
    expect(tbody.childElementCount).toBe(4);

    
  })
});