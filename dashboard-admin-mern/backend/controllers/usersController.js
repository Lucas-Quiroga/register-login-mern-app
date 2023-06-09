const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("./../models/User");
require("../passportConfig");

//funcion para registrar al Usuario (método POST)
async function registerUser(req, res) {
  const { email, password, confirmPassword } = req.body;
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Las contraseñas no coinciden" });
  }
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ message: "El correo electrónico ya está registrado" });
    }
    if (!password || typeof password !== "string") {
      throw new Error("Contraseña inválida");
    }
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const newUser = new User({ email, password: hash });
    await newUser.save();
    return res.status(200).json({ message: "Te has registrado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Ha ocurrido un error al registrar el usuario",
      error: error.message,
    });
  }
}

const loginUser = (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ success: false, message: "Error en el servidor" });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado en la base de datos",
      });
    }

    req.login(user, (err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Error en el servidor" });
      }

      return res.status(200).json({
        success: true,
        message: "Inicio de sesión exitoso",
        email: user.email,
      });
    });
  })(req, res, next);
};

//funcion para deslogear al Usuario (método GET)
async function logout(req, res) {
  try {
    req.logout(function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al cerrar sesión" });
      }
      return res.status(200).json({ success: true, redirectTo: "/login" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al cerrar sesión" });
  }
}

module.exports = {
  registerUser,
  loginUser,
  logout,
};
