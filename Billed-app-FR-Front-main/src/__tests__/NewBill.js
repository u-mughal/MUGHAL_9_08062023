/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import BillsUI from "../views/BillsUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import router from "../app/Router.js";
import Store from "../app/Store";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", { value: localStorageMock });
		Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH["NewBill"] } });

		window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
		document.body.innerHTML = `<div id="root"></div>`;
		router();
	});

	describe("When I am on NewBill Page", () => {
		test("Then I can choose file with good extension", async () => {
			const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
			const inputFile = screen.getByTestId("file");

			const file = new File(["contenu du fichier fake"], "facture.png", { type: "image/png" });

			inputFile.addEventListener("change", handleChangeFile);
			fireEvent.change(inputFile, { target: { files: [file] } });

			expect(handleChangeFile).toBeCalled();
            expect(inputFile.files.length).toBe(1);
			expect(inputFile.files[0].name).toBe("facture.png");
		});

		test("Then I can choose a file with a bad extension", async () => {
			const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
			const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
			const inputFile = screen.getByTestId("file");

			const file = new File(["contenu du fichier fake"], "facture.pdf", { type: "application/pdf" });

			inputFile.addEventListener("change", handleChangeFile);
			fireEvent.change(inputFile, { target: { files: [file] } });

			expect(handleChangeFile).toBeCalled();
			expect(inputFile.value).toBeFalsy();
		});
	});
});