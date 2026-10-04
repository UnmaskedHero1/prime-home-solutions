from pydantic import BaseModel, Field, model_validator


class ContactIn(BaseModel):
    name: str = Field(max_length=120)
    phone: str = Field(default="", max_length=40)
    email: str = Field(default="", max_length=254)
    service: str = Field(default="", max_length=80)
    message: str = Field(default="", max_length=2000)

    @model_validator(mode="after")
    def clean(self):
        self.name = " ".join(self.name.split())
        self.phone = self.phone.strip()
        self.email = self.email.strip()
        self.service = self.service.strip()
        self.message = self.message.strip()
        if not self.name:
            raise ValueError("Name is required.")
        if not self.phone and not self.email:
            raise ValueError("Enter a phone number or an email.")
        if self.email and "@" not in self.email:
            raise ValueError("Enter a valid email.")
        return self


class ContactOut(BaseModel):
    id: int
    detail: str = "Request received. We will be in touch."
