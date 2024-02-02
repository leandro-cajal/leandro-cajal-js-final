let productos = [];
let url = "./productos.json";

async function cargarProductos() {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al cargar el archivo JSON. Código de error: ${response.status}`);
        }
        productos = await response.json(); // Cargar productos directamente desde el JSON
        return productos; // Devolver la lista de productos
    } catch (error) {
        console.error(error);
        throw error; // Lanzar el error para que sea manejado por el llamador
    }
}

// verificar si hay datos en el localStorage al cargar la pagina
if (localStorage.getItem('productos')) {
    productos = JSON.parse(localStorage.getItem('productos'));
} else {
    // si no hay datos en el localStorage, cargar desde el JSON
    cargarProductos()
        .then(() => mostrarProductos())
        .catch(error => console.error(error));
}

// funcion para agregar un producto al registro
function agregarProducto() {
    let nombre = document.querySelector("#nombre").value.trim();
    let precio = parseFloat(document.querySelector("#precio").value);
    let stock = parseInt(document.querySelector("#stock").value);

    // validar que todos los campos esten completos
    if (!nombre || isNaN(precio) || isNaN(stock)) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    // crear un objeto producto
    let nuevoProducto = { nombre, precio, stock };

    // obtener los campos de atributos adicionales
    const atributosContainer = document.getElementById("atributosContainer");
    const camposAtributos = atributosContainer.querySelectorAll("div");

    // Agregar los atributos adicionales al objeto producto
    camposAtributos.forEach(function (atributo) {
        let nombreAtributo = atributo.querySelector("input[name='nombreAtributo']").value.trim();
        let valorAtributo = atributo.querySelector("input[name='valorAtributo']").value.trim();
        if (nombreAtributo && valorAtributo) {
            nuevoProducto[nombreAtributo] = valorAtributo;
        }
    });

    // agregar el producto al array
    productos.push(nuevoProducto);

    // almacenar productos en el localStorage
    localStorage.setItem('productos', JSON.stringify(productos));

    // limpiar formulario y campos de atributos
    document.getElementById("formulario").reset();
    atributosContainer.innerHTML = "";

    Toastify({
        text: `Producto agregado con éxito`,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #4d3efc, #4d3efc)",
    }).showToast();
    mostrarProductos(); // mostrar productos después de agregar uno nuevo
}


// funcion para buscar un producto por nombre
function buscarProducto() {
    let nombreBusqueda = document.getElementById("nombreBusqueda").value.trim().toLowerCase();

    if (!nombreBusqueda) {
        Swal.fire({
            title: 'Error',
            text: 'Por favor, ingrese un nombre para buscar.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
        return;
    }

    const resultadoBusqueda = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(nombreBusqueda)
    );

    if (resultadoBusqueda.length > 0) {
        const productoEncontrado = resultadoBusqueda[0];
        const indiceProductoEncontrado = productos.indexOf(productoEncontrado);
        verDetalles(indiceProductoEncontrado); // Pasar el índice del producto, no el objeto
    } else {
        // mostrar SweetAlert indicando que el producto no existe
        Swal.fire({
            title: 'Producto no encontrado',
            text: 'El producto no existe en el catálogo.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
}



// funcion para manejar el boton "Añadir Atributo"
document.getElementById("botonAgregarAtributo").addEventListener("click", agregarAtributoEnAgregarProducto);

function agregarAtributoEnAgregarProducto() {
    const atributosContainer = document.getElementById("atributosContainer");

    // Crear un nuevo conjunto de campos para atributos
    const nuevoAtributo = document.createElement("div");
    nuevoAtributo.innerHTML = `
        <label for="nombreAtributo">Nombre del atributo adicional:</label>
        <input type="text" name="nombreAtributo" placeholder="Ej. Descripción">
        <br>
        <label for="valorAtributo">Valor del atributo adicional:</label>
        <input type="text" name="valorAtributo">
        <br>
    `;

    // agregar el nuevo conjunto de campos al contenedor
    atributosContainer.appendChild(nuevoAtributo);
}

// funcion para cambiar el stock de un producto
function cambiarStock(index) {
    const producto = productos[index];

    // crear un input de tipo number para ingresar el nuevo stock
    Swal.fire({
        title: 'Modificar Stock',
        html: 'Ingrese el nuevo stock:',
        input: 'number',
        inputValue: producto.stock,
        showCancelButton: true,
        inputValidator: (value) => {
            // validar que el valor ingresado sea un número válido
            if (!value || isNaN(value)) {
                return 'Por favor, ingrese un número válido.';
            }
            // actualizar el stock y mostrar los productos nuevamente
            productos[index].stock = parseInt(value);
            mostrarProductos();
        }
    });
}

// funcion para eliminar un producto
function eliminarProducto(index) {
    Swal.fire({
        title: `¿Seguro que quieres eliminar ${productos[index].nombre}?`,
        text: "Esta acción no se puede deshacer.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aceptar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            productos.splice(index, 1);
            mostrarProductos();
            Swal.fire(
                'Eliminado',
                'El producto ha sido eliminado.',
                'success'
            );
        }
    });
}

// funcion para mostrar tarjetas de productos
function mostrarProductos() {
    const tarjetasProductos = document.getElementById("tarjetasProductos");
    tarjetasProductos.innerHTML = ""; // Limpiar contenido existente

    if (productos.length > 0) {
        productos.forEach(function (producto, index) {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
                <h6>${producto.nombre}</h6>
                <p>Precio: $${producto.precio}</p>
                <p>Stock: ${producto.stock}</p>
                <div>
                    <button onclick="cambiarStock(${index})">Cambiar Stock</button>
                    <button onclick="eliminarProducto(${index})">Eliminar</button>
                    <button onclick="verDetalles(${index})">Ver Detalles</button>
                </div>  
            `;

            tarjetasProductos.appendChild(card);
        });
    } else {
        // mensaje para indicar que no hay productos
        const mensajeSinProductos = document.createElement("p");
        mensajeSinProductos.innerText = "No hay productos en el catálogo.";
        tarjetasProductos.appendChild(mensajeSinProductos);
    }
    // almacenar productos en el localStorage después de mostrarlos
    localStorage.setItem('productos', JSON.stringify(productos));
}
// funcion para ver detalles del producto
function verDetalles(index) {
    const producto = productos[index];

    // construir el mensaje con todos los detalles del producto
    let mensaje = `<strong>Nombre:</strong> ${producto.nombre}<br>`;
    mensaje += `<strong>Precio:</strong> $${producto.precio}<br>`;
    mensaje += `<strong>Stock:</strong> ${producto.stock}<br>`;

    // agregar los detalles de los atributos adicionales
    for (const atributo in producto) {
        if (atributo !== 'nombre' && atributo !== 'precio' && atributo !== 'stock') {
            mensaje += `<strong>${atributo}:</strong> ${producto[atributo]}<br>`;
        }
    }

    // mostrar SweetAlert con los detalles del producto
    Swal.fire({
        title: 'Detalles del Producto',
        html: mensaje,
        icon: 'info',
        confirmButtonText: 'Cerrar'
    });
}

// funcion principal que se ejecuta al hacer clic en el botón
function ejecutarAccion() {
    let opcion = document.getElementById("opcion").value;

    switch (opcion) {
        case "agregar":
            agregarProducto();
            break;
        case "buscar":
            buscarProducto();
            break;
        case "mostrar":
            mostrarProductos();
            break;
        default:
            alert("Opción no válida. Por favor, elija una opción correcta.");
    }

    // limpiar campos despues de ejecutar la accion
    limpiarCampos();
}

// funcion para limpiar los campos del formulario
function limpiarCampos() {
    // limpiar campos de entrada
    document.getElementById("nombre").value = "";
    document.getElementById("precio").value = "";
    document.getElementById("stock").value = "";
    document.getElementById("nombreBusqueda").value = "";

    // obtener la opcion seleccionada
    const opcionSeleccionada = document.getElementById("opcion").value;

    // ocultar campos segun la opcion seleccionada (excepto para la opción "mostrar")
    if (opcionSeleccionada === "mostrar") {
        document.getElementById("camposAgregar").style.display = "none";
        document.getElementById("camposBuscar").style.display = "none";
    }
}

// funcion para mostrar u ocultar campos segun la opción seleccionada
function mostrarCampos(opcion) {
    // Mostrar campos según la opción seleccionada
    document.getElementById("camposAgregar").style.display = opcion === "agregar" ? "block" : "none";
    document.getElementById("camposBuscar").style.display = opcion === "buscar" ? "block" : "none";

    // limpiar campos de atributos cuando no estás en la opcion "agregar"
    if (opcion !== "agregar") {
        const atributosContainer = document.getElementById("atributosContainer");
        atributosContainer.innerHTML = "";
    }
}

// asignar el evento onchange para mostrar/ocultar campos segun la opcion seleccionada
document.getElementById("opcion").addEventListener("change", function () {
    mostrarCampos(this.value);
});

// asignar el evento clic al botón usando addEventListener
document.getElementById("botonEjecutar").addEventListener("click", ejecutarAccion);

// asignar el evento clic al boton "Agregar Atributo"
document.getElementById("botonAgregarAtributo").addEventListener("click", agregarAtributoEnAgregarProducto);

// asignar el evento clic al botón "Buscar" en la funcion buscarProducto
document.getElementById("botonBuscar").addEventListener("click", buscarProducto);
