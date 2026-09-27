import hashlib
from unittest.mock import Mock, patch

import pytest
from fastapi import HTTPException

from app.api.dependencies.auth import (
    authenticate_api_key,
    require_admin
)


def create_mock_api_key(raw_key: str, is_active: bool = True):
    mock_api_key = Mock()

    mock_api_key.id = 1
    mock_api_key.key_hash = hashlib.sha256(
        raw_key.encode("utf-8")
    ).hexdigest()
    mock_api_key.is_active = is_active
    mock_api_key.rate_limit = 10

    return mock_api_key


def test_missing_api_key():

    db = Mock()

    with pytest.raises(HTTPException) as error:

        authenticate_api_key(
            x_aegisflow_key=None,
            db=db
        )

    assert error.value.status_code == 401
    assert error.value.detail == "Missing AegisFlow API key"


def test_invalid_api_key():

    db = Mock()

    db.query.return_value.filter.return_value.first.return_value = None

    with pytest.raises(HTTPException) as error:

        authenticate_api_key(
            x_aegisflow_key="invalid-key",
            db=db
        )

    assert error.value.status_code == 401
    assert error.value.detail == (
        "Invalid or inactive AegisFlow API key"
    )


def test_valid_api_key():

    raw_key = "af_test_key"

    mock_api_key = create_mock_api_key(
        raw_key
    )

    db = Mock()

    db.query.return_value.filter.return_value.first.return_value = (
        mock_api_key
    )

    with patch(
        "app.api.dependencies.auth.check_rate_limit"
    ) as mock_rate_limit:

        result = authenticate_api_key(
            x_aegisflow_key=raw_key,
            db=db
        )

    assert result == mock_api_key

    mock_rate_limit.assert_called_once_with(
        1,
        10
    )

def test_require_admin_success():

    mock_api_key = Mock()

    mock_api_key.is_admin = True

    result = require_admin(
        api_key=mock_api_key
    )

    assert result == mock_api_key


def test_require_admin_forbidden():

    mock_api_key = Mock()

    mock_api_key.is_admin = False

    with pytest.raises(HTTPException) as error:

        require_admin(
            api_key=mock_api_key
        )

    assert error.value.status_code == 403

    assert error.value.detail == (
        "Admin access required"
    )