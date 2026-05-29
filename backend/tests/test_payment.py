from tests.conftest import (
    create_org_and_admin, create_driver,
    create_customer, create_vehicle, create_delivery
)

class TestPayment:

    def test_payment_created_with_delivery(self, client):
        token = create_org_and_admin(client, "pay1")
        admin_headers = {"Authorization": f"Bearer {token}"}
        _, customer_headers = create_customer(
            client, admin_headers, "pay1"
        )
        delivery = create_delivery(client, customer_headers)

        response = client.get(
            f"/deliveries/{delivery['id']}/payment",
            headers=customer_headers
        )
        assert response.status_code == 200
        assert response.json()["payment_status"] == "pending"
        print("✅ Payment record auto-created with delivery")

    def test_customer_can_pay(self, client):
        token = create_org_and_admin(client, "pay2")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, _ = create_driver(client, admin_headers, "pay2")
        _, customer_headers = create_customer(
            client, admin_headers, "pay2"
        )
        vehicle = create_vehicle(client, admin_headers, "PAY2")
        delivery = create_delivery(client, customer_headers)

        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 800
            },
            headers=admin_headers
        )

        response = client.post(
            f"/deliveries/{delivery['id']}/payment",
            json={
                "amount": 800,
                "transaction_reference": "TEST-TXN-001"
            },
            headers=customer_headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["payment_status"] == "paid"
        assert data["amount"] == 800
        print("✅ Customer payment works")

    def test_cannot_pay_twice(self, client):
        token = create_org_and_admin(client, "pay3")
        admin_headers = {"Authorization": f"Bearer {token}"}
        driver_user, _ = create_driver(client, admin_headers, "pay3")
        _, customer_headers = create_customer(
            client, admin_headers, "pay3"
        )
        vehicle = create_vehicle(client, admin_headers, "PAY3")
        delivery = create_delivery(client, customer_headers)

        client.put(
            f"/deliveries/{delivery['id']}/assign",
            json={
                "driver_id": driver_user["id"],
                "vehicle_id": vehicle["id"],
                "total_cost": 800
            },
            headers=admin_headers
        )

        # First payment
        client.post(
            f"/deliveries/{delivery['id']}/payment",
            json={"amount": 800, "transaction_reference": "TXN-1"},
            headers=customer_headers
        )

        # Second payment
        response = client.post(
            f"/deliveries/{delivery['id']}/payment",
            json={"amount": 800, "transaction_reference": "TXN-2"},
            headers=customer_headers
        )
        assert response.status_code == 400
        print("✅ Duplicate payment rejected")