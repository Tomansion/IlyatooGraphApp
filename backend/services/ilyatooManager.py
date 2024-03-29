from config.init_config import get_config, ERROR_COLOR, DEBUG_COLOR
from termcolor import colored
import requests

WORKS_COLLECTION_NAME = "works"

url = None
token = None


def setup():
    global db, url, token
    # Load config
    config = get_config()
    url = config["ILYATOO"]["URL"]
    USERNAME = config["ILYATOO"]["USERNAME"]
    PASSWORD = config["ILYATOO"]["PASSWORD"]

    # Connect to Ilyatoo
    print("\nConnecting to Ilyatoo...")
    print(f" - URL: {colored(url, DEBUG_COLOR)}")
    print(f" - USERNAME: {colored(USERNAME, DEBUG_COLOR)}")

    token = login(USERNAME, PASSWORD)

    if token is None:
        raise ValueError("Failed to login to Ilyatoo.")

    # Initialize the Ilyatoo client.
    print(" - Connection established")


def login(USERNAME, PASSWORD):
    login_response = requests.post(
        url + "/api/login", json={"username": USERNAME, "password": PASSWORD}
    )

    if login_response.status_code != 200:
        raise ValueError(
            "Failed to login to Ilyatoo. Status code: "
            + colored(login_response.status_code, ERROR_COLOR)
        )

    return login_response.cookies["PHPSESSID"]


def get_linked_elements(element_name):
    verbs = [
        "CONCERNER",
        "FAIRE PARTIE",
        "TOURNER",
        "ÊTRE (ATTRIBUT)",
        "PARLER",
        "ÉCRIRE",
    ]

    response = []

    for verb in verbs:
        elements_url = url + f"/proposition/api/action-objet/{verb}/{element_name}"
        verb_response = requests.get(elements_url, cookies={"PHPSESSID": token})

        if verb_response.status_code != 200:
            raise ValueError(
                f"Failed to get linked '{element_name}' elements from Ilyatoo. Status code: "
                + colored(verb_response.status_code, ERROR_COLOR)
            )

        response += verb_response.json()[:30]

    return response
